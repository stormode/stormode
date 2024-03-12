import * as path from "node:path";

import * as fse from "fs-extra";
import dotenv from "dotenv";

import { root } from "#/configs/env";

const envLoader = async (): Promise<void> => {
    const { terminal } = await import("#/utils/terminal");
    const env: string = process.env.NODE_ENV || "development";
    const envFiles: string[] = [
        ".env",
        ".env.local",
        `.env.${env}`,
        `.env.${env}.local`,
    ];

    for (const envFile of envFiles) {
        const fullPath: string = path.join(root, envFile);

        if (await fse.exists(fullPath)) {
            dotenv.config({ override: true, path: fullPath });
            terminal.info(`Env loaded from ${envFile}`);
        }
    }
};

export { envLoader };
