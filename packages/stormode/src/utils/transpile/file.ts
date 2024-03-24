import type { FullConfig } from "#/@types/config";

import { transpile } from "#/utils/transpile/transpile";

type BuildFileOptions = {
    config: FullConfig;
    inPath: string;
    outPath: string;
};

const transpileFile = async (options: BuildFileOptions): Promise<void> => {
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
