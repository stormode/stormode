import * as path from "node:path";

import * as fse from "fs-extra";

type Dependencies = {
    [key: string]: string;
};

type AddPackageJson = {
    name: string;
    projectRoot: string;
    framework: "vanilla" | "express" | "koa" | "fastify";
    variant: "ts" | "js";
};

const addPackageJson = async (options: AddPackageJson) => {
    // declarations
    const isExpress: boolean = options.framework === "express";
    const isKoa: boolean = options.framework === "koa";
    const isFastify: boolean = options.framework === "fastify";

    const isTs: boolean = options.variant === "ts";

    const dependencies: Dependencies = {
        // express
        ...(isExpress
            ? {
                  express: "^4.19.2",
                  cors: "^2.8.5",
                  "cookie-parser": "^1.4.6",
              }
            : {}),
        // koa
        ...(isKoa
            ? {
                  koa: "^2.15.2",
                  "@koa/router": "^12.0.1",
              }
            : {}),
        // fastify
        ...(isFastify
            ? {
                  fastify: "^4.26.2",
              }
            : {}),
    };

    const tsDevDependencies: Dependencies = {
        // express
        ...(isExpress
            ? {
                  "@types/express": "^4.17.21",
                  "@types/cors": "^2.8.17",
                  "@types/cookie-parser": "^1.4.7",
              }
            : {}),
        // koa
        ...(isKoa
            ? {
                  "@types/koa": "^2.15.0",
                  "@types/koa__router": "^12.0.4",
              }
            : {}),
        "@types/node": "^20.12.5",
        typescript: "^5.4.4",
    };

    // package.json
    const packageJson = {
        name: options.name,
        version: "1.0.0",
        private: true,
        scripts: {
            dev: "stormode dev",
            build: isTs ? "tsc && stormode build" : "stormode build",
            preview: "stormode preview",
        },
        dependencies: dependencies,
        devDependencies: {
            ...(isTs ? tsDevDependencies : {}),
            stormode: "0.5.x",
        },
    };

    const packageJsonData: string = JSON.stringify(packageJson, null, 4);

    await fse.writeFile(
        path.join(options.projectRoot, "package.json"),
        packageJsonData,
    );
};

export { addPackageJson };
