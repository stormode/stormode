import type { Answers, Framework, VrChoice } from "#/@types/question";

import * as path from "node:path";

import * as fse from "fs-extra";
import prompts from "prompts";
import terminal, { color } from "stormode-terminal";

import { addBaseFiles } from "#/functions/addBaseFiles";
import { addTsConfigJson } from "#/functions/addTsConfigJson";
import { copyContent } from "#/functions/copyContent";
import { existsAndRename } from "#/functions/existsAndRename";

import { getFrameworkVariants, getFrameworks } from "#/utils/framework";

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
                    choices: getFrameworks(),
                },
                {
                    type: (fw: Framework) => {
                        return fw && (fw.variants ? "select" : null);
                    },
                    name: "variant",
                    message: "Select a variant:",
                    choices: (fw: Framework): VrChoice[] =>
                        getFrameworkVariants(fw),
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

        // is it typescript
        const isTs: boolean = variant === "ts";

        // create-stormode root
        const packageRoot: string = path.resolve(__dirname, "..");
        // project root
        let projectRoot: string = path.join(root, name);

        // change target project name on repeat
        projectRoot = await existsAndRename({
            root,
            name,
        });

        // generate directory
        await fse.mkdir(projectRoot);

        terminal.wait("Creating files...");

        // tsconfig.json
        if (isTs) {
            await addTsConfigJson({
                projectRoot,
            });
        }

        // add base files
        const templateRoot: string = path.resolve(
            packageRoot,
            "templates",
            "default",
        );

        await addBaseFiles({
            templateRoot,
            projectRoot,
            framework,
            variant,
        });

        // add specific template
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
