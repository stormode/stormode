import type { FSWatcher } from "chokidar";

import * as childProcess from "node:child_process";

type ExecuteOptions = {
    outPath: string;
    watcher?: FSWatcher;
    onChange?: (filePath: string) => boolean | Promise<boolean>;
};

const execute = async (options: ExecuteOptions): Promise<void> => {
    // declarations
    const { terminal } = await import("#/utils/terminal");
    let progress: childProcess.ChildProcess | null = null;

    const start = (): void => {
        terminal.wait("Starting...");

        progress = childProcess.spawn("node", [
            "--enable-source-maps",
            "--no-warnings",
            options.outPath,
        ]);

        // biome-ignore lint: string, number, boolean, object
        progress.stdout?.on("data", (data: any): void => {
            const output: string = data.toString().trim();
            if (output.length > 0) console.log(output);
        });

        // biome-ignore lint: string, number, boolean, object
        progress.stderr?.on("data", (data: any): void => {
            const output: string = data.toString().trim();
            if (output.length > 0) console.log(output);
            if (options.watcher && options.onChange) {
                terminal.error("Crashed, waiting for changes...");
            } else {
                terminal.error("Crashed, something went wrong...?");
            }
        });

        // end parent on child successful exit
        progress.on("exit", (code: number | null): void => {
            if (code === 0) process.exit();
        });
    };

    // on change
    options.watcher?.on("change", async (filePath: string): Promise<void> => {
        if (options.onChange) {
            progress?.kill();
            // only restart on successful change
            const success: boolean = await options.onChange(filePath);
            if (success === false) return void 0;
            start();
        }
    });

    // start
    start();

    // end child on parent exit
    process.on("exit", (): void => {
        progress?.kill();
    });
};

export { execute };
