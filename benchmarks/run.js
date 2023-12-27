import fs from "fs/promises";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { loadMessages, sampleMessages } from "./setup.js";
import { benchmark as benchmarkI18Next } from "./i18next/benchmark.js";
import { benchmark as benchmarkParaglide } from "./paraglide/benchmark.js";
import { measureDirSize } from "./measure.js";
import { getPermutations } from "./utils.js";
import { pool as Pool } from "./pool.js";

/** @type {Record<string, import("./project.js").BenchmarkProject>} */
const BENCHMARKS = {
  paraglide: benchmarkParaglide,
  i18next: benchmarkI18Next,
};


const __dirname = fileURLToPath(new URL(".", import.meta.url));
const messages = await loadMessages(resolve(__dirname, "../messages"));

//Make sure the directory where all the benchmark projects will be created exists
const benchmark_project_dir = resolve(__dirname, `./.projects`);
await fs.mkdir(benchmark_project_dir, { recursive: true });

// creates for which parameters we want to run the benchmark
const languageSizes = [1, 2, 5, 10, 20, 30, 40, 50, 61];
const messageSizes = [1, 5, 10, 20, 50, 100, 300, 500, 800, 1000, 1400, 1852];
const permutations = getPermutations(languageSizes, messageSizes);

const pool = Pool();

/**
 * @type {Record<string, Array<{languageSize: number, messageSize: number, uncompressed: number, gzipped: number}>>}
 */
const results = {};

for (const [benchmark_name, benchmark] of Object.entries(BENCHMARKS)) {
  results[benchmark_name] = [];
  for (const [languageSize, messageSize] of permutations) {
    pool.add(async () => {
      const benchmarkDir = resolve(
        benchmark_project_dir,
        `${benchmark_name}_${languageSize}_${messageSize}`
      );

      try {
        const messagesForRun = sampleMessages(
          messages,
          languageSize,
          messageSize
        );
        const buildDir = await benchmark(messagesForRun, benchmarkDir);
        const measureResult = await measureDirSize(buildDir);

        console.log({ languageSize, messageSize, ...measureResult });
        results[benchmark_name].push({
          languageSize,
          messageSize,
          ...measureResult,
        });
      } catch (e) {
        console.error(e);
      }
    });
  }
}

await pool.run(8);

//sort results
for (const [benchmark_name, result] of Object.entries(results)) {
  results[benchmark_name] = result.sort(
    (a, b) => {
      if (a.languageSize !== b.languageSize) return a.languageSize - b.languageSize;
      return a.messageSize - b.messageSize;
    }
  );
}

const resultsDir = resolve(__dirname, "./results");
await fs.mkdir(resultsDir, { recursive: true });

for (const [benchmark_name, result] of Object.entries(results)) {
  let csv = "languageSize,messageSize,uncompressed,gzipped\n";
  csv += result
    .map(
      ({ languageSize, messageSize, uncompressed, gzipped }) =>
        `${languageSize},${messageSize},${uncompressed},${gzipped}`
    )
    .join("\n");
  await fs.writeFile(resolve(resultsDir, `${benchmark_name}.csv`), csv);
}
