import type { Mode } from "#/@types/mode";
import type { BuildArgs, DevArgs, PreviewArgs } from "#/@types/args";
import type { ImpartialConfig, Config } from "#/@types/config";
import type { packageJson } from "#/utils/package/config";

import * as fse from "fs-extra";
import { Command } from "commander";

import { cache } from "#/configs/env";

import { packageJsonLoader } from "#/utils/package/config";
import { configLoader } from "#/utils/config/loader";
import { setProcessEnv } from "#/utils/env";

import { runDev } from "#/commands/dev";
import { runBuild } from "#/commands/build";
import { runPreview } from "#/commands/preview";

(async (): Promise<void> => {
    try {
        // declarations
        const program: Command = new Command();

        let mode: Mode = "dev";
        let args: Partial<DevArgs | BuildArgs | PreviewArgs> = {};

        const pkj: packageJson | null = await packageJsonLoader();

        // info
        program
            .name("stormode")
            .description("Stormode, A Build Tool for Node")
            .version(
                `v${pkj ? pkj.name : "0.0.0"}`,
                "-v, --version",
                "get stormode version",
            );

        // dev
        program
            .command("dev")
            .description("development server")
            // base
            .option("-c, --config <path>", "config file path")
            .option(
                "--withtime, --withTime, --withTime <utc | local>",
                "terminal with time",
            )
            // dev
            .option("--rootdir, --rootDir <directory>", "input directory")
            .option("--outdir, --outDir <directory>", "output directory")
            .option("--index <file>", "index file name")
            .option("--tsconfig <path>", "tsconfig.json path")
            .action(async (_args: DevArgs): Promise<void> => {
                mode = "dev";
                args = _args;
                process.env.NODE_ENV = "development";
            });

        // build
        program
            .command("build")
            .description("project builder")
            // base
            .option("-c, --config <path>", "config file path")
            .option(
                "--withtime, --withTime, --withTime <utc | local>",
                "terminal with time",
            )
            // build
            .option("-e, --env <name>", "environment name")
            .option("--rootdir, --rootDir <directory>", "input directory")
            .option("--outdir, --outDir <directory>", "output directory")
            .option("--index <file>", "index file name")
            .option("--tsconfig <path>", "tsconfig.json path")
            .option("--platform <node | browser>", "platform")
            .option("--bundle", "bundle code")
            .option("--minify", "minify code")
            .option("--map, --sourcemap, --sourceMap", "generate sourcemap")
            .action(async (_args: BuildArgs): Promise<void> => {
                mode = "build";
                args = _args;
                process.env.NODE_ENV = _args.env ?? "production";
            });

        // preview
        program
            .command("preview")
            .description("production preview")
            //base
            .option("-c, --config <path>", "config file path")
            .option(
                "--withtime, --withTime, --withTime <utc | local>",
                "terminal with time",
            )
            // preview
            .option("--outdir, --outDir <directory>", "output path")
            .option("--index <file>", "index file name")
            .action(async (_args: PreviewArgs): Promise<void> => {
                mode = "preview";
                args = _args;
            });

        // parse
        program.parse();

        // ensure temp folder
        await fse.ensureDir(cache);

        // load config
        const config: ImpartialConfig = await configLoader({
            mode: mode,
            args: args,
        });

        // preview
        // @ts-expect-error program will change the mode
        if (mode === "preview") {
            return await runPreview(config);
        }

        await setProcessEnv();

        switch (mode) {
            // dev
            case "dev":
                return await runDev(config);
            // build
            // @ts-expect-error program will change the mode
            case "build":
                return await runBuild(config);
            default:
                throw new Error("Invalid command");
        }
    } catch (e: unknown) {
        const { terminal } = await import("#/utils/terminal");
        terminal.error(e instanceof Error ? e.message : String(e));
    }
})();

export { Config };
