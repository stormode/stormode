import type { Answers, Framework, VrChoice } from "#/@types/question";

import * as path from "node:path";

import * as fse from "fs-extra";
import prompts from "prompts";
import terminal, { color } from "stormode-terminal";

import { copyContent } from "#/functions/copyContent";
import { latest } from "#/functions/getLatestVersion";

import { getFramework, getFrameworkVariant } from "#/utils/framework";

type Dependencies = {
    [key: string]: string;
};

const cwd: string = process.cwd();
const root: string = path.resolve(cwd);

(async (): Promise<void> => {
    try {
        // welcome message
        terminal.info(`Welcome to ${color.blue("Stormode")}`);
        terminal.info("A Build Tool for Node");

        // get answers
        const answers: Answers = await prompts(
            [
                {
                    type: "text",
                    name: "name",
                    message: "Project name:",
                    initial: "stormode-project",
                },
                {
                    type: "select",
                    name: "framework",
                    message: "Select a framework:",
                    choices: getFramework(),
                },
                {
                    type: (fw: Framework) => {
                        return fw && (fw.variants ? "select" : null);
                    },
                    name: "variant",
                    message: "Select a variant:",
                    choices: (fw: Framework): VrChoice[] =>
                        getFrameworkVariant(fw),
                },
            ],
            {
                onCancel: (): void => {
                    const err = "Installation cancelled";
                    throw new Error(err);
                },
            },
        );

        terminal.wait("Creating project...");

        // answers
        const name: string = answers.name.toLowerCase();
        const framework: "vanilla" | "express" | "koa" | "fastify" =
            answers.framework.value;
        const variant: "ts" | "js" = answers.variant;

        // for framework specific contents
        const isVanilla: boolean = framework === "vanilla";
        const isExpress: boolean = framework === "express";
        const isKoa: boolean = framework === "koa";
        const isFastify: boolean = framework === "fastify";

        // is it typescript
        const isTs: boolean = variant === "ts";

        // create-stormode root
        const packageRoot: string = path.resolve(__dirname, "..");
        // project root
        let projectRoot: string = path.join(root, name);

        // change target project name on repeat
        let counter: number = 2;
        const existmsg: string = `Folder (${name}${
            counter > 2 ? `-${(counter - 1).toString()}` : ""
        }) already exists`;
        const existmsg2: string = `project renamed to (${name}-${counter})`;

        while (await fse.exists(projectRoot)) {
            projectRoot = path.join(root, `${name}-${counter}`);
            terminal.info(`${existmsg}, ${existmsg2}`);
            counter++;
        }

        // generate directory
        await fse.mkdir(projectRoot);

        // fetch latest dependencies
        terminal.wait("Fetching dependencies data...");

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
                      "@types/cookie-parser": await latest(
                          "@types/cookie-parser",
                      ),
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
            name: name,
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
            path.join(projectRoot, "package.json"),
            packageJsonData,
        );

        // tsconfig.json
        if (isTs) {
            const tsconfigJson = {
                compilerOptions: {
                    target: "ES2022",
                    useDefineForClassFields: true,
                    module: "CommonJS",
                    moduleResolution: "Node10",
                    baseUrl: ".",
                    paths: {
                        "#/*": ["./src/*"],
                    },
                    resolveJsonModule: true,
                    noEmit: true,
                    isolatedModules: true,
                    esModuleInterop: true,
                    forceConsistentCasingInFileNames: true,
                    strict: true,
                    alwaysStrict: true,
                    skipLibCheck: true,
                },
                include: ["src/**/*"],
            };

            const tsconfigJsonData: string = JSON.stringify(
                tsconfigJson,
                null,
                4,
            );

            await fse.writeFile(
                path.join(projectRoot, "tsconfig.json"),
                tsconfigJsonData,
            );
        }

        terminal.wait("Creating files...");

        // copy default files
        const templateDefault: string = path.resolve(
            packageRoot,
            "templates",
            "default",
        );

        // .gitattributes
        await fse.copy(
            path.join(templateDefault, "_gitattributes"),
            path.join(projectRoot, ".gitattributes"),
        );

        // .gitignore
        await fse.copy(
            path.join(templateDefault, "_gitignore"),
            path.join(projectRoot, ".gitignore"),
        );

        // .env
        await fse.ensureFile(path.join(projectRoot, ".env"));

        // .env.development
        if (isVanilla) {
            await fse.ensureFile(path.join(projectRoot, ".env.development"));
        } else {
            await fse.copy(
                path.join(templateDefault, ".env.development"),
                path.join(projectRoot, ".env.development"),
            );
        }

        // .env.production
        if (isVanilla) {
            await fse.ensureFile(path.join(projectRoot, ".env.production"));
        } else {
            await fse.copy(
                path.join(templateDefault, ".env.production"),
                path.join(projectRoot, ".env.production"),
            );
        }

        // stormode.config.js
        const SmConfigName: string = `stormode.config.${isTs ? "ts" : "js"}`;

        await fse.copy(
            path.join(templateDefault, SmConfigName),
            path.join(projectRoot, SmConfigName),
        );

        // specific template
        const template: string = path.resolve(
            packageRoot,
            "templates",
            framework ?? "vanilla",
            variant ?? "js",
        );

        await copyContent(template, projectRoot);

        // done
        terminal.ready("Project created successfully");
    } catch (e: unknown) {
        terminal.error(e instanceof Error ? e.message : String(e));
    }
})();
