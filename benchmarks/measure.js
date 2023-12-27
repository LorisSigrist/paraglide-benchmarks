import { resolve } from "node:path";
import fs from "node:fs/promises";
import { execAsync } from "./utils.js";

/**
 * @param {string} dir The absolute path to the directory to measure
 * @returns {Promise<{ uncompressed: number, gzipped: number}>} The size of the directory in bytes
 */
export async function measureDirSize(dir) {
  const files = await fs.readdir(dir);
  if (files.length === 0) return { uncompressed: 0, gzipped: 0 };

  let normalSize = 0;
  let gzippedSize = 0;

  for (const file of files) {
    const filePath = resolve(dir, file);

    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      const result = await measureDirSize(filePath);
      normalSize += result.uncompressed;
      gzippedSize += result.gzipped;
    }

    if (stats.isFile()) {
      normalSize += stats.size;
      const gzippedFileSize = parseInt(
        (await execAsync(`gzip -c ${filePath} | wc -c`)).toString()
      );
      gzippedSize += gzippedFileSize;
    }
  }

  return { uncompressed: normalSize, gzipped: gzippedSize };
}
