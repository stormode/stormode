import type { ImpartialConfig } from "../@types/config";

import * as path from "node:path";
import * as childProcess from "node:child_process";

import chokidar from "chokidar";
import terminal from "stormode-terminal";

import buildDir from "../utils/build/dir";
import buildFile from "../utils/build/file";

const cwd = process.cwd();
let runCode: childProcess.ChildProcess | null = null;
let isBuilding = false;

const dev = async (config: ImpartialConfig): Promise<void> => {
    // declarations
    const rootDir: string = path.resolve(cwd, config.rootDir);
    const tempDir: string = path.resolve(cwd, config.outDir, ".temp");
    const outDir: string = path.resolve(cwd, config.outDir, "cache");
    const outPath: string = path.join(
        outDir,
        config.index.replace(".ts", ".js"),
    );

    // execfile
    const executeFile = async () => {
        terminal.info("Starting...");

        if (runCode) {
            runCode.kill();
        }

        runCode = childProcess.spawn("node", [outPath]);

        // output
        runCode.stdout &&
            runCode.stdout.on("data", (data) => {
                const output: string = data.toString().trim();
                if (output.length > 0) {
                    console.log(output);
                }
            });

        // error
        runCode.stderr &&
            runCode.stderr.on("data", (data) => {
                const output: string = data.toString().trim();
                if (output.length > 0) {
                    console.log(output);
                }
            });

        runCode.on("exit", (code: number) => {
            if (code && code !== 0) {
                terminal.error("Crashed, wating for changes...");
            }
        });
    };

    // build and run
    const buildAndRun = async (filePath: string) => {
        if (isBuilding) {
            return;
        }

        isBuilding = true;
        terminal.wait("Applying changes...");

        try {
            await buildFile(config, rootDir, tempDir, outDir, filePath, true);
            await executeFile();
        } catch (err: any) {
            console.log(err.message);
            terminal.error("Apply failed, waiting for changes...");
        } finally {
            isBuilding = false;
        }
    };

    // watcher
    const watch = [`${config.rootDir}`, ...(config.server.watch ?? [])];
    const ignore = config.server.ignore ?? [];

    const watcher = chokidar.watch(watch, {
        ignored: ignore,
        persistent: true,
    });

    watcher.on("change", async (filePath) => {
        await buildAndRun(filePath);
    });

    await buildDir(config, rootDir, tempDir, outDir, true);
    await executeFile();
};

export default dev;
