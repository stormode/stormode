import type { Config, ImpartialConfig } from "./@types/config";
import type { DevArgs, BuildArgs, PreviewArgs } from "./@types/args";

import * as os from "node:os";
import * as path from "node:path";

import * as fse from "fs-extra";
import { Command } from "commander";
import terminal from "stormode-terminal";

import configFinder from "./utils/config/finder";
import configLoader from "./utils/config/loader";
import configCliApplier from "./utils/config/applier";
import envLoader from "./utils/envs/loader";

import dev from "./commands/dev";
import build from "./commands/build";
import preview from "./commands/preview";

const cwd = process.cwd();

const main = async (): Promise<void> => {
    try {
        // declarations
        const program = new Command();

        let mode: string | null = null;

        let devArgs: DevArgs = {};
        let buildArgs: BuildArgs = {};
        let previewArgs: PreviewArgs = {};

        // info
        program
            .name("stormode")
            .description("Stormode, A Build Tool for Node")
            .version("v0.3.1", "-v, --version", "get stormode version");

        // dev
        program
            .command("dev")
            .description("development server")
            .option("-c, --config <directory + file>", "config file path")
            .option("--rootdir, --rootDir <directory>", "input directory")
            .option("--outdir, --outDir <directory>", "output directory")
            .option("--index <file>", "index file name")
            .option("--tsconfig <directory + file>", "tsconfig.json path")
            .action(async (args: DevArgs) => {
                mode = "dev";
                devArgs = args;
                process.env.NODE_ENV = "development";
            });

        // build
        program
            .command("build")
            .description("project builder")
            .option("-c, --config <directory + file>", "config file path")
            .option("-e, --env <name>", "environment name")
            .option("--rootdir, --rootDir <directory>", "input directory")
            .option("--outdir, --outDir <directory>", "output directory")
            .option("--index <file>", "index file name")
            .option("--minify", "minify code")
            .option("--map, --sourcemap", "generate sourcemap")
            .option("--tsconfig <directory + file>", "tsconfig.json path")
            .action(async (args: BuildArgs) => {
                mode = "build";
                buildArgs = args;
                process.env.NODE_ENV = args.env ?? "production";
            });

        // preview
        program
            .command("preview")
            .description("production preview")
            .option("-c, --config <directory + file>", "config file path")
            .option("--outdir, --outDir <directory>", "output path")
            .option("--index <file>", "index file name")
            .action(async (args: PreviewArgs) => {
                mode = "preview";
                previewArgs = args;
            });

        // parse
        program.parse();

        // god mode
        if (!mode) {
            throw new Error("Command not found");
        }

        // get config
        const configPath: string = await configFinder();
        const configRaw: Config | null = await configLoader(
            devArgs.config ||
                buildArgs.config ||
                previewArgs.config ||
                configPath,
        );

        // apply config from CLI
        const config: ImpartialConfig = await configCliApplier(
            configRaw,
            mode,
            devArgs,
            buildArgs,
            previewArgs,
        );

        // preview
        if (mode === "preview") {
            return await preview(config);
        }

        // load env
        await envLoader();

        switch (mode) {
            // dev
            case "dev":
                return await dev(config);
            // build
            case "build":
                return await build(config);
            default:
                throw new Error("Unvalid command");
        }
    } catch (err: any) {
        const osTempDir: string = path.join(os.tmpdir(), "stormode");
        const tempDir: string = path.join(cwd, ".stormode", ".temp");
        if (await fse.exists(osTempDir)) {
            await fse.rm(osTempDir, { recursive: true });
        }
        if (await fse.exists(tempDir)) {
            await fse.rm(tempDir, { recursive: true });
        }
        terminal.error(err.message);
    }
};

main();
export type { Config };
