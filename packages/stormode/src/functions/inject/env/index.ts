import type { ImpartialConfig } from "#/@types/config";

import { writeFile, readFile } from "fs-extra";

type InjectEnvOptions = {
    path: string;
    config: ImpartialConfig;
};

const injectEnv = async (options: InjectEnvOptions): Promise<void> => {
    const _o: InjectEnvOptions = options;

    await writeFile(
        _o.path,
        `process.env.NODE_ENV="${process.env.NODE_ENV}";` +
            (_o.config.build.minify ? "" : "\n") +
            (await readFile(_o.path, "utf8")),
    );
};

export { injectEnv };
