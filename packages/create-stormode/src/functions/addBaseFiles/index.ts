import * as path from "node:path";

import * as fse from "fs-extra";

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
    await fse.copy(
        path.join(o.templateRoot, "_gitattributes"),
        path.join(o.projectRoot, ".gitattributes"),
    );

    // .gitignore
    await fse.copy(
        path.join(o.templateRoot, "_gitignore"),
        path.join(o.projectRoot, ".gitignore"),
    );

    // .env
    await fse.ensureFile(path.join(o.projectRoot, ".env"));

    // .env.development
    if (isVanilla) {
        await fse.ensureFile(path.join(o.projectRoot, ".env.development"));
    } else {
        await fse.copy(
            path.join(o.templateRoot, ".env.development"),
            path.join(o.projectRoot, ".env.development"),
        );
    }

    // .env.production
    if (isVanilla) {
        await fse.ensureFile(path.join(o.projectRoot, ".env.production"));
    } else {
        await fse.copy(
            path.join(o.templateRoot, ".env.production"),
            path.join(o.projectRoot, ".env.production"),
        );
    }

    // stormode.config.js
    const SmConfigName: string = `stormode.config.${isTs ? "ts" : "js"}`;

    await fse.copy(
        path.join(o.templateRoot, SmConfigName),
        path.join(o.projectRoot, SmConfigName),
    );
};

export { addBaseFiles };
