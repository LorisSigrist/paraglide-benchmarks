import { execAsync } from "../utils.js";
import fs from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * @type {import("../project.js").BenchmarkProject}
 */
export async function benchmark(messages, outDir) {
  //Make sure the output directory exists
  const templateDir = resolve(__dirname, "./template");
  // 2. Set up the project
  await setUpProject(messages, templateDir, outDir);
  // 4. build the project
  await execAsync("pnpm build", { cwd: outDir });
  // 5. measure the size of the build
  const buildDir = resolve(outDir, "dist/assets");
  return buildDir;
}

/**
 * @param {Record<string, Record<string, string>>} messages
 * @param {string} templateDir
 * @param {string} outDir
 * @param {Record<string, Record<string, string>>} messages
 */
async function setUpProject(messages, templateDir, outDir) {
  const languageTags = Object.keys(messages);
  // 1. copy the template directory to the output directory
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });
  await fs.cp(templateDir, outDir, { recursive: true });

  //4. Add code that uses all the messages
  const entryFilePath = resolve(outDir, "./src/index.js");
  const entryFile = await fs.readFile(entryFilePath, { encoding: "utf-8" });

  const newEntryFile = entryFile
    .replace("%messages%", JSON.stringify(messages))
    .replace(
      "%invocations%",
      Object.keys(messages[languageTags[0]])
        .map((messageID) => `l(i18next.t('${messageID}'));`)
        .join("\n")
    );

  await fs.writeFile(entryFilePath, newEntryFile);
}