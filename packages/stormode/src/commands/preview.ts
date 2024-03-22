import type { ImpartialConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { root } from "#/configs/env";

import { execute } from "#/functions/execute";
import { getTranspiledName } from "#/functions/getTranspiledName";

const runPreview = async (config: ImpartialConfig): Promise<void> => {
    const outDir: string = path.join(root, config.outDir);
    const outFile: string = getTranspiledName(config.index);
    const outPath: string = path.join(outDir, outFile);

    // check if entry exists
    if (!(await fse.exists(outPath)))
        throw new Error(`Unable·to·find·the·entry:${outPath}`);

    // execute
    execute({
        outPath,
    });
};

export { runPreview };
