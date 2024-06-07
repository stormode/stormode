import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";

const ensureFile = async (path: string): Promise<void> => {
    if (!fs.existsSync(path)) {
        await fsp.writeFile(path, "");
    }
};

const ensureDir = async (path: string): Promise<void> => {
    if (!fs.existsSync(path)) {
        await fsp.mkdir(path, { recursive: true });
    }
};

const copy = async (from: string, to: string): Promise<void> => {
    let isFile: boolean = true;

    if ((await fsp.stat(from)).isDirectory()) {
        isFile = false;
    }

    if (!fs.existsSync(to)) {
        if (isFile) {
            await fsp.mkdir(path.dirname(to), { recursive: true });
        } else {
            await fsp.mkdir(to, { recursive: true });
        }
    }

    if (isFile) {
        return await fsp.copyFile(from, to);
    }

    const files: string[] = await fsp.readdir(from);

    for await (const file of files) {
        await copy(path.join(from, file), path.join(to, file));
    }
};

export { ensureFile, ensureDir, copy };
