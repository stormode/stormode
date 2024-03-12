import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";
import { spawnSync } from "node:child_process";

import * as fse from "fs-extra";
import { replaceTscAliasPaths } from "tsc-alias";

import { isDev, cwd, root } from "#/configs/env";

type BuildDirOptions = {
    config: ImpartialConfig;
    inDir: string;
    outDir: string;
};

const transpileDir = async (options: BuildDirOptions): Promise<void> => {
    // declarations
    const { config, inDir, outDir } = options;
    const tsConfigPath: string = path.join(root, config.tsconfig);

    // check tsc
    const tsc: string = path.join(cwd, "node_modules", ".bin", "tsc");
    const tscExists: boolean = await fse.exists(tsc);

    if (!tscExists)
        throw new Error(
            "tsc command not found, please install TypeScript dependency",
        );

    // transpile
    spawnSync(
        tsc,
        [
            "--project",
            tsConfigPath,
            "--rootDir",
            inDir,
            "--outDir",
            outDir,
            ...(isDev()
                ? [
                      "--sourceMap",
                      "true",
                      "--inlineSourceMap",
                      "false",
                      "--inlineSources",
                      "false",
                  ]
                : ["--sourceMap", config.build.sourceMap ? "true" : "false"]),
        ],
        { shell: true },
    );

    // reaplce absolute paths
    await replaceTscAliasPaths({
        configFile: tsConfigPath,
        outDir: outDir,
    });
};

export { transpileDir };
