import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";

const ensureFile = async (filePath: string): Promise<void> => {
    if (!fs.existsSync(filePath)) {
        await fsp.mkdir(path.dirname(filePath), { recursive: true });
        await fsp.writeFile(filePath, "");
    }
};

const ensureDir = async (dirPath: string): Promise<void> => {
    if (!fs.existsSync(dirPath)) {
        await fsp.mkdir(dirPath, { recursive: true });
    }
};

const copy = async (from: string, to: string): Promise<void> => {
    const isFile: boolean = (await fsp.stat(from)).isFile();

    if (!fs.existsSync(to)) {
        if (isFile) {
            await fsp.mkdir(path.dirname(to), { recursive: true });
        } else {
            await fsp.mkdir(to, { recursive: true });
        }
    }

    if (isFile) {
        await fsp.copyFile(from, to);
    } else {
        const items: string[] = await fsp.readdir(from);

        for await (const item of items) {
            await copy(path.join(from, item), path.join(to, item));
        }
    }
};

export { ensureFile, ensureDir, copy };
