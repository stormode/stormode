import type { BuildArgs, DevArgs, PreviewArgs } from "#/@types/args";
import type { FullConfig } from "#/@types/config";
import type { Mode } from "#/@types/mode";
import type { PackageJson } from "#/utils/package/config";

import * as path from "node:path";

import { Command, Option } from "commander";
import * as fse from "fs-extra";

import { cache, root } from "#/configs/env";

import { configLoader } from "#/utils/config/loader";
import { logProcessEnv, setProcessEnv } from "#/utils/env";
import { stormodePackageJsonLoader } from "#/utils/package/config";
import { tsConfigLoader } from "./utils/typescript/config";

import { runBuild } from "#/commands/build";
import { runDev } from "#/commands/dev";
import { runPreview } from "#/commands/preview";

(async (): Promise<void> => {
    try {
        // declarations
        const program: Command = new Command();

        let mode: Mode = "dev";
        let args: Partial<DevArgs | BuildArgs | PreviewArgs> = {};

        const pkj: PackageJson | null = await stormodePackageJsonLoader();

        // options

        const configOption: Option = new Option(
            "-c, --config <path>",
            "config file path",
        );

        const withTimeOption: Option = new Option(
            "--withtime, --withTime, --withTime <utc | local>",
            "terminal with time",
        );

        const rootDirOption: Option = new Option(
            "--rootdir, --rootDir <directory>",
            "input directory",
        );

        const outDirOption: Option = new Option(
            "--outdir, --outDir <directory>",
            "output directory",
        );

        const indexOption: Option = new Option(
            "--index <file>",
            "index file name",
        );

        const tsConfigOption: Option = new Option(
            "--tsconfig <path>",
            "tsconfig.json path",
        );

        // info
        program
            .name("stormode")
            .description("Stormode, A Build Tool for Node")
            .version(
                `v${pkj ? pkj.version : "0.0.0"}`,
                "-v, --version",
                "get the current version of Stormode",
            );

        // dev
        program
            .command("dev")
            .description("development server")
            .addOption(configOption)
            .addOption(withTimeOption)
            .addOption(rootDirOption)
            .addOption(outDirOption)
            .addOption(indexOption)
            .addOption(tsConfigOption)
            .action(async (_args: DevArgs): Promise<void> => {
                mode = "dev";
                args = _args;
                process.env.NODE_ENV = "development";
            });

        // build
        program
            .command("build")
            .description("project builder")
            .addOption(configOption)
            .addOption(withTimeOption)
            .option("-e, --env <name>", "environment name")
            .addOption(rootDirOption)
            .addOption(outDirOption)
            .addOption(indexOption)
            .addOption(tsConfigOption)
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
            .addOption(configOption)
            .addOption(withTimeOption)
            .addOption(outDirOption)
            .addOption(indexOption)
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
            mode,
            args,
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
