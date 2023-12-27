import { pickRandomSubset } from "./utils.js";
import fs from "node:fs/promises";
import { resolve } from "node:path";

/**
 *
 * @param {Record<string, Record<string, string>>} messages
 * @param {number} num_languages
 * @param {number} num_messages
 * @returns {Record<string, Record<string, string>>}
 */
export function sampleMessages(messages, num_languages, num_messages) {
  const availableLanguages = Object.keys(messages);
  const languages = pickRandomSubset(availableLanguages, num_languages);
  const messageIds = pickRandomSubset(
    Object.keys(messages[languages[0]]),
    num_messages
  );

  /** @type {Record<string, Record<string, string>>} */
  const result = {};
  for (const lang of languages) {
    result[lang] = {};
    for (const messageId of messageIds) {
      result[lang][messageId] = messages[lang][messageId];
    }
  }

  return result;
}

/**
 * Returns a dictionary of all langages and their messages
 *
 * @param {string} messagesDir
 * @returns {Promise<Record<string, Record<string, string>>>}
 */
export async function loadMessages(messagesDir) {
  const files = await fs.readdir(messagesDir);

  /** @type {Record<string, Record<string, string>>} */
  const messages = {};

  for (const file of files) {
    const filePath = resolve(messagesDir, file);
    const content = await fs.readFile(filePath, { encoding: "utf-8" });
    const lang = file.split(".")[0];

    messages[lang] = JSON.parse(content);
  }

  return messages;
}
