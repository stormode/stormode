import type * as fs from "node:fs";

import * as fsp from "node:fs/promises";
import * as path from "node:path";

import { copy, ensureDir } from "#/utils/fs";

const copyContent = async (source: string, target: string): Promise<void> => {
    try {
        await ensureDir(target);

        const files: string[] = await fsp.readdir(source);

        for await (const file of files) {
            const cSource: string = path.join(source, file);
            const cTarget: string = path.join(target, file);
            const stat: fs.Stats = await fsp.stat(cSource);

            if (stat.isDirectory()) {
                await copyContent(cSource, cTarget);
            } else {
                await copy(cSource, cTarget);
            }
        }
    } catch (e: unknown) {
        const ermsg: string = `failed to copy content from ${source} to ${target}`;
        throw new Error(ermsg);
    }
};

export { copyContent };
