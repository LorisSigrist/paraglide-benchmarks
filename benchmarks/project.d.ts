/**
 * A function that creates and builds a project with the given messages
 * @param messages The messages that should be used for this run
 * @param projectDir Where the project should be created
 * 
 * @returns The path to the output directory
 */
export type BenchmarkProject = (
    messages: Record<string, Record<string, string>>,
    projectDir: string,
) => Promise<string>;