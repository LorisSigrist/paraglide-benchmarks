import fs from "fs/promises";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { execAsync } from "../utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * @type {import("../project.js").BenchmarkProject}
 */
export async function benchmark(messages, outDir) {
  const templateDir = resolve(__dirname, "./template");

  // 2. Set up the project
  await setUpParaglideProject(messages, templateDir, outDir);

  //3. install dependencies
  //await execAsync("pnpm i", { cwd: outDir });

  // 4. build the project
  await execAsync("pnpm build", { cwd: outDir });

  return resolve(outDir, "dist/assets");
}

/**
 * @param {Record<string, Record<string, string>>} messages
 * @param {string} templateDir
 * @param {string} outDir
 * @param {Record<string, Record<string, string>>} messages
 */
async function setUpParaglideProject(messages, templateDir, outDir) {
  const languageTags = Object.keys(messages);

  // 1. copy the template directory to the output directory
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir);
  await fs.cp(templateDir, outDir, { recursive: true });

  // 2. write the messages to the messages directory
  await fs.mkdir(resolve(outDir, "messages"));
  for (const lang of languageTags) {
    await fs.writeFile(
      resolve(outDir, `messages/${lang}.json`),
      JSON.stringify(messages[lang], null, 2)
    );
  }

  // 3. replace the placeholder in outDir/project.inlang/settings.json with the language tags
  const settingsFilePath = resolve(outDir, "project.inlang/settings.json");
  const settings = await fs.readFile(settingsFilePath, { encoding: "utf-8" });
  const newSettings = settings
    .replace("%LANGUAGE_TAGS%", JSON.stringify(languageTags))
    .replace("%SOURCE_LANGUAGE_TAG%", languageTags[0]);
  await fs.writeFile(settingsFilePath, newSettings);

  //4. Add code that uses all the messages
  const entryFilePath = resolve(outDir, "./src/index.js");
  const entryFile = await fs.readFile(entryFilePath, { encoding: "utf-8" });
  const newEntryFile =
    entryFile +
    "\nconst l = console.log" +
    "\n\n" +
    Object.keys(messages[languageTags[0]])
      .map((messageID) => `l(m.${messageID}({}));`)
      .join("\n");
  await fs.writeFile(entryFilePath, newEntryFile);
}
