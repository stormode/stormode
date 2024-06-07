import * as path from "node:path";

import { copy, ensureFile } from "#/utils/fs";

type AddBaseFiles = {
    templateRoot: string;
    projectRoot: string;
    framework: string;
    variant: string;
};

const addBaseFiles = async (options: AddBaseFiles): Promise<void> => {
    const o: AddBaseFiles = options;

    const isVanilla: boolean = o.framework === "vanilla";
    const isTs: boolean = o.variant === "ts";

    // .gitattributes
    await copy(
        path.join(o.templateRoot, "_gitattributes"),
        path.join(o.projectRoot, ".gitattributes"),
    );

    // .gitignore
    await copy(
        path.join(o.templateRoot, "_gitignore"),
        path.join(o.projectRoot, ".gitignore"),
    );

    // .env
    await ensureFile(path.join(o.projectRoot, ".env"));

    // .env.development
    if (isVanilla) {
        await ensureFile(path.join(o.projectRoot, ".env.development"));
    } else {
        await copy(
            path.join(o.templateRoot, ".env.development"),
            path.join(o.projectRoot, ".env.development"),
        );
    }

    // .env.production
    if (isVanilla) {
        await ensureFile(path.join(o.projectRoot, ".env.production"));
    } else {
        await copy(
            path.join(o.templateRoot, ".env.production"),
            path.join(o.projectRoot, ".env.production"),
        );
    }

    // stormode.config.js
    const SmConfigName: string = `stormode.config.${isTs ? "ts" : "js"}`;

    await copy(
        path.join(o.templateRoot, SmConfigName),
        path.join(o.projectRoot, SmConfigName),
    );
};

export { addBaseFiles };
