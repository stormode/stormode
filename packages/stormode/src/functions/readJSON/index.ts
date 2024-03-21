import * as fse from "fs-extra";
import { parse } from "jsonc-parser";

const readJSON = async <T = unknown>(path: string): Promise<T | null> => {
    try {
        // check if path exists
        if (!(await fse.pathExists(path))) return null;

        // read
        const content: string = await fse.readFile(path, {
            encoding: "utf-8",
        });

        // parse
        const json: T = await parse(content, [], {
            allowEmptyContent: true,
            allowTrailingComma: false,
            disallowComments: true,
        });

        // result
        return json;
    } catch (e: unknown) {
        return null;
    }
};

export { readJSON };
