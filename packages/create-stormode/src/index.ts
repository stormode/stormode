import type {
    Framework,
    FwChoice,
    VrChoice,
    Answers,
    Variant,
} from "./@types/question";

import * as path from "node:path";

import * as fse from "fs-extra";
import prompts from "prompts";
import fetch from "npm-registry-fetch";
import terminal, { color } from "stormode-terminal";

const cwd: string = process.cwd();

const frameworks: Framework[] = [
    {
        title: "Vanilla",
        value: "vanilla",
        color: color.green,
        variants: [
            {
                title: "Vanilla + TypeScript",
                value: "ts",
                color: color.blue,
            },
            {
                title: "Vanilla + JavaScript",
                value: "js",
                color: color.yellow,
            },
        ],
    },
    {
        title: "Express",
        value: "express",
        color: color.yellow,
        variants: [
            {
                title: "Express + TypeScript",
                value: "ts",
                color: color.blue,
            },
            {
                title: "Express + JavaScript",
                value: "js",
                color: color.yellow,
            },
        ],
    },
    {
        title: "Koa",
        value: "koa",
        color: color.purple,
        variants: [
            {
                title: "Koa + TypeScript",
                value: "ts",
                color: color.blue,
            },
            {
                title: "Koa + JavaScript",
                value: "js",
                color: color.yellow,
            },
        ],
    },
    {
        title: "Fastify",
        value: "fastify",
        color: null,
        variants: [
            {
                title: "Fastify + TypeScript",
                value: "ts",
                color: color.blue,
            },
            {
                title: "Fastify + JavaScript",
                value: "js",
                color: color.yellow,
            },
        ],
    },
];

const getFramework = (): FwChoice[] => {
    return frameworks.map(
        (fw: Framework): FwChoice => ({
            title: fw.color ? fw.color(fw.title) : fw.title,
            value: fw,
        }),
    );
};

const getVariant = (fw: Framework): VrChoice[] => {
    const choices: VrChoice[] = [];
    fw.variants &&
        fw.variants.map((variant: Variant): void => {
            choices.push({
                title: variant.color(variant.title),
                value: variant.value,
            });
        });
    return choices;
};

type PkgInfo = {
    "dist-tags": {
        latest: string;
        [tag: string]: string;
    };
};

const lastVer = async (name: string): Promise<string> => {
    try {
        const registryUrl: string = "https://registry.npmjs.org/";
        const packageUrl: string = `${registryUrl}${name}`;

        const response: PkgInfo = (await fetch.json(packageUrl)) as PkgInfo;
        const latestVersion: string = response["dist-tags"]["latest"];
        return "^" + latestVersion;
    } catch (e: unknown) {
        const ermsg: string = `Failed to get the latest version of ${name}`;
        throw new Error(ermsg);
    }
};

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

const main = async (): Promise<void> => {
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
                    choices: (fw: Framework): VrChoice[] => getVariant(fw),
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

        // name: any;
        // framework: vanilla | express | koa;
        // variant: ts | js;
        const name: string = answers.name.toLowerCase();
        const framework: string = answers.framework.value;
        const variant: string = answers.variant;

        // for framework specific contents
        const isExpress: boolean = framework === "express";
        const isKoa: boolean = framework === "koa";
        const isFastify: boolean = framework === "fastify";

        const isTs: boolean = variant === "ts";

        // stormode root
        const packageDir: string = path.resolve(__dirname, "..");
        // target project root
        let targetDir: string = path.resolve(cwd, name);

        // change target project name on repeat
        let counter: number = 2;
        const existmsg: string = `Folder (${name}${
            counter > 2 ? "-" + (counter - 1).toString() : ""
        }) already exists`;
        const existmsg2: string = `project renamed to (${name}-${counter})`;

        while (await fse.exists(targetDir)) {
            targetDir = path.resolve(cwd, name + `-${counter}`);
            terminal.info(`${existmsg}, ${existmsg2}`);
            counter++;
        }

        await fse.mkdir(targetDir);

        // fetch latest dependencies
        terminal.wait("Fetching dependencies data...");

        const dependencies = {
            // express
            ...(isExpress
                ? {
                      express: await lastVer("express"),
                      cors: await lastVer("cors"),
                      "cookie-parser": await lastVer("cookie-parser"),
                  }
                : {}),
            // koa
            ...(isKoa
                ? {
                      koa: await lastVer("koa"),
                      "koa-router": await lastVer("koa-router"),
                  }
                : {}),
            // fastify
            ...(isFastify
                ? {
                      fastify: await lastVer("fastify"),
                  }
                : {}),
        };

        const tsDevDependencies = {
            // express
            ...(isExpress
                ? {
                      "@types/express": await lastVer("@types/express"),
                      "@types/cors": await lastVer("@types/cors"),
                      "@types/cookie-parser": await lastVer(
                          "@types/cookie-parser",
                      ),
                  }
                : {}),
            // koa
            ...(isKoa
                ? {
                      "@types/koa": await lastVer("@types/koa"),
                      "@types/koa-router": await lastVer("@types/koa-router"),
                  }
                : {}),
            "@types/node": await lastVer("@types/node"),
            typescript: await lastVer("typescript"),
        };

        // package.json
        const packageJson = {
            name: name,
            version: "1.0.0",
            private: true,
            scripts: {
                dev: "stormode dev",
                build: "stormode build",
                preview: "stormode preview",
            },
            dependencies: dependencies,
            devDependencies: {
                ...(isTs ? tsDevDependencies : {}),
                stormode: await lastVer("stormode"),
            },
        };

        const packageJsonData: string = JSON.stringify(packageJson, null, 4);
        await fse.writeFile(
            path.join(targetDir, "package.json"),
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
                path.join(targetDir, "tsconfig.json"),
                tsconfigJsonData,
            );
        }

        terminal.wait("Creating files...");

        // copy default files
        const templateDefault: string = path.resolve(
            packageDir,
            "templates",
            "default",
        );

        // .gitignore
        await fse.copy(
            path.join(templateDefault, "_gitignore"),
            path.join(targetDir, ".gitignore"),
        );

        // .env.development
        await fse.copy(
            path.join(templateDefault, ".env.development"),
            path.join(targetDir, ".env.development"),
        );

        // .env.production
        await fse.copy(
            path.join(templateDefault, ".env.production"),
            path.join(targetDir, ".env.production"),
        );

        // stormode.config.js
        const SmConfigName: string = `stormode.config.${isTs ? "ts" : "js"}`;

        await fse.copy(
            path.join(templateDefault, SmConfigName),
            path.join(targetDir, SmConfigName),
        );

        // specific template
        const template: string = path.resolve(
            packageDir,
            "templates",
            framework ?? "vanilla",
            variant ?? "js",
        );

        await copyContent(template, targetDir);

        // done
        terminal.ready("Project created successfully");
    } catch (e: unknown) {
        terminal.error(e instanceof Error ? e.message : String(e));
    }
};

main();
