import { exec } from "node:child_process";

/**
 * @type {(command: string, options?: import("child_process").ExecOptions) => Promise<string| Buffer>}
 * @returns
 */
export const execAsync = (command, options) =>
  new Promise((resolve, reject) => {
    exec(command, options, (err, stdout, stderr) => {
      if (err) {
        console.log(stderr);
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });

/**
 *
 * @param {string[]} choices
 * @param {number} num
 * @returns {string[]}
 */
export function pickRandomSubset(choices, num) {
  if (num >= choices.length) return choices;
  if (num === 0) return [];

  const result = [];
  while (result.length < num) {
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    if (!result.includes(randomChoice)) {
      result.push(randomChoice);
    }
  }
  return result;
}


/**
 * @template T1
 * @template T2
 * @param {T1[]} array1 
 * @param {T2[]} array2 
 * @returns {[T1, T2][]}
 */
export function getPermutations(array1, array2) {
  /** @type {[T1, T2][]} */
  const permutations = [];
  for (const element1 of array1) {
    for (const element2 of array2) {
      permutations.push([element1, element2]);
    }
  }

  return permutations;
}