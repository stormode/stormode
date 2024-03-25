import * as path from "node:path";

import * as fse from "fs-extra";
import { latest } from "#/functions/getLatestVersion";

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
                  express: await latest("express"),
                  cors: await latest("cors"),
                  "cookie-parser": await latest("cookie-parser"),
              }
            : {}),
        // koa
        ...(isKoa
            ? {
                  koa: await latest("koa"),
                  "koa-router": await latest("koa-router"),
              }
            : {}),
        // fastify
        ...(isFastify
            ? {
                  fastify: await latest("fastify"),
              }
            : {}),
    };

    const tsDevDependencies: Dependencies = {
        // express
        ...(isExpress
            ? {
                  "@types/express": await latest("@types/express"),
                  "@types/cors": await latest("@types/cors"),
                  "@types/cookie-parser": await latest("@types/cookie-parser"),
              }
            : {}),
        // koa
        ...(isKoa
            ? {
                  "@types/koa": await latest("@types/koa"),
                  "@types/koa-router": await latest("@types/koa-router"),
              }
            : {}),
        "@types/node": await latest("@types/node"),
        typescript: await latest("typescript"),
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
            stormode: await latest("stormode"),
        },
    };

    const packageJsonData: string = JSON.stringify(packageJson, null, 4);

    await fse.writeFile(
        path.join(options.projectRoot, "package.json"),
        packageJsonData,
    );
};

export { addPackageJson };
