import type { FullConfig } from "#/@types/config";

import { transpile } from "#/utils/transpile/transpile";

type TranspileFileOptions = {
    config: FullConfig;
    inPath: string;
    outPath: string;
};

const transpileFile = async (options: TranspileFileOptions): Promise<void> => {
    // declarations
    const { config, inPath, outPath } = options;

    // transpile
    await transpile({
        config,
        inPath,
        outPath,
    });
};

export { transpileFile };
