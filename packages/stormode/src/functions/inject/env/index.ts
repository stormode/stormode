import { writeFile, readFile } from "fs-extra";

const injectEnv = async (path: string): Promise<void> => {
    await writeFile(
        path,
        `process.env.NODE_ENV="${process.env.NODE_ENV}";` +
            (await readFile(path, "utf8")),
    );
};

export { injectEnv };
