import type { BuildArgs, DevArgs, PreviewArgs } from "#/@types/args";
import type { FullConfig } from "#/@types/config";
import type { Mode } from "#/@types/mode";
import type { PackageJson } from "#/utils/package/config";

import * as path from "node:path";

import { Command } from "commander";
import * as fse from "fs-extra";

import { cache, root } from "#/configs/env";

import { configLoader } from "#/utils/config/loader";
import { logProcessEnv, setProcessEnv } from "#/utils/env";
import { stormodePackageJsonLoader } from "#/utils/package/config";
import { tsConfigLoader } from "./utils/typescript/config";

import { runBuild } from "#/commands/build";
import { runDev } from "#/commands/dev";
import { runPreview } from "#/commands/preview";

const programWithBaseOptions = (program: Command): Command => {
    return program
        .option("-c, --config <path>", "config file path")
        .option(
            "--withtime, --withTime, --withTime <utc | local>",
            "terminal with time",
        );
};

(async (): Promise<void> => {
    try {
        // declarations
        const program: Command = new Command();

        let mode: Mode = "dev";
        let args: Partial<DevArgs | BuildArgs | PreviewArgs> = {};

        const pkj: PackageJson | null = await stormodePackageJsonLoader();

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
        programWithBaseOptions(
            program.command("dev").description("development server"),
        )
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
        programWithBaseOptions(
            program.command("build").description("project builder"),
        )
            .option("-e, --env <name>", "environment name")
            .option("--rootdir, --rootDir <directory>", "input directory")
            .option("--outdir, --outDir <directory>", "output directory")
            .option("--index <file>", "index file name")
            .option("--tsconfig <path>", "tsconfig.json path")
            .option("--bundle", "bundle code")
            .option("--minify", "minify code")
            .option("--map, --sourcemap, --sourceMap", "generate sourcemap")
            .action(async (_args: BuildArgs): Promise<void> => {
                mode = "build";
                args = _args;
                process.env.NODE_ENV = _args.env ?? "production";
            });

        // preview
        programWithBaseOptions(
            program.command("preview").description("production preview"),
        )
            .option("--outdir, --outDir <directory>", "output path")
            .option("--index <file>", "index file name")
            .action(async (_args: PreviewArgs): Promise<void> => {
                mode = "preview";
                args = _args;
            });

        // parse
        await program.parseAsync();

        // ensure temp folder
        await fse.ensureDir(cache);

        // load config
        const config: FullConfig = await configLoader({
            mode: mode,
            args: args,
        });

        // preview
        // @ts-expect-error - program will change the mode
        if (mode === "preview") {
            return await runPreview(config);
        }

        // load env
        await setProcessEnv();
        await logProcessEnv();

        // pre call to cache
        await tsConfigLoader({
            path: path.join(root, config.tsconfig),
        });

        switch (mode) {
            // dev
            case "dev":
                return await runDev(config);
            // build
            // @ts-expect-error - program will change the mode
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
