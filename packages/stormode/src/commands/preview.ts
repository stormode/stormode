import type { FullConfig } from "#/@types/config";

import * as path from "node:path";

import * as fse from "fs-extra";

import { root } from "#/configs/env";

import { execute } from "#/functions/execute";
import { getTranspiledName } from "#/functions/getTranspiledName";

const runPreview = async (config: FullConfig): Promise<void> => {
    const outDir: string = path.join(root, config.outDir);
    const outFile: string = getTranspiledName(config.index);
    const outPath: string = path.join(outDir, outFile);

    // check if entry point exists
    if (!(await fse.exists(outPath))) {
        const { terminal } = await import("#/utils/terminal");

        terminal.error("Unable to find the entry point");
        terminal.error("Please check if `index.ts` or `index.js` exists");
        terminal.error(
            "Or edit the `index` configuration to adjust the entry point",
        );

        return void 0;
    }

    // execute
    execute({
        outPath,
    });
};

export { runPreview };
