/**
 * @param {(()=>Promise<any>)[]} queue
 * @returns {(parallel: number)=>Promise<any[]>}
 */
const run = (queue) => async (parallel) => {
  const results = [];
  const jobs = [];
  for (let i = 0; i < Math.min(parallel, queue.length); i++) {
    jobs.push(runJob(queue, results));
  }
  await Promise.all(jobs);
  return results;
};

/**
 * @param {(()=>Promise<any>)[]} queue
 * @param {any[]} results
 * @returns {Promise<void>}
 */
const runJob = async (queue, results) => {
  const job = queue.shift();
  if (!job) return;
  results.push(await job());
  if (queue.length) {
    await runJob(queue, results);
  }
};

const pool = () => {
  /** @type {(()=>Promise<any>)[]} */
  const queue = [];
  return {
    /**
     * @param {()=>Promise<any>} fx
     * @returns
     */
    add: (fx) => queue.push(fx),
    run: run(queue),
  };
};

export { pool };
