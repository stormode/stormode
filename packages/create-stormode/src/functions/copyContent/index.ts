import * as path from "node:path";

import * as fse from "fs-extra";

const copyContent = async (source: string, target: string): Promise<void> => {
    try {
        await fse.ensureDir(target);

        const files: string[] = await fse.readdir(source);

        for (const file of files) {
            const cSource: string = path.join(source, file);
            const cTarget: string = path.join(target, file);
            const stat: fse.Stats = await fse.stat(cSource);

            if (stat.isDirectory()) {
                await copyContent(cSource, cTarget);
            } else {
                await fse.copyFile(cSource, cTarget);
            }
        }
    } catch (e: unknown) {
        const ermsg: string = `failed to copy content from ${source} to ${target}`;
        throw new Error(ermsg);
    }
};

export { copyContent };
