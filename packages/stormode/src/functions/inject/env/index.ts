import type { ImpartialConfig } from "#/@types/config";

import { writeFile, readFile } from "fs-extra";

type InjectEnvOptions = {
    config: ImpartialConfig;
    path: string;
};

const injectEnv = async (options: InjectEnvOptions): Promise<void> => {
    const { config, path }: InjectEnvOptions = options;

    await writeFile(
        path,
        `process.env.NODE_ENV="${process.env.NODE_ENV}";` +
            (config.build.minify ? "" : "\n") +
            (await readFile(path, "utf8")),
    );
};

export { injectEnv };
