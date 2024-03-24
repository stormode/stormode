import type { FullConfig } from "#/@types/config";

import { readFile, writeFile } from "fs-extra";

type InjectEnvOptions = {
    config: FullConfig;
    path: string;
};

const injectEnv = async (options: InjectEnvOptions): Promise<void> => {
    const { config, path }: InjectEnvOptions = options;

    await writeFile(
        path,
        // biome-ignore lint: readability
        `process.env.NODE_ENV="${process.env.NODE_ENV}";` +
            (config.build.minify ? "" : "\n") +
            (await readFile(path, "utf8")),
    );
};

export { injectEnv };
