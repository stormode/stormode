import type { Envs } from "#/@types/env";

import * as path from "node:path";

import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import * as fse from "fs-extra";

import { root } from "#/configs/env";

type ProcessEnvFile = {
    name: string;
    content: string;
};

/**
 * process.env = {
 *     NODE_ENV: "production",
 *     // ...
 * };
 *
 * processEnv = {
 *     "process.env.NODE_ENV": "production",
 *     // ...
 * }
 */

const processEnvFiles: ProcessEnvFile[] = [];
const processEnv: Envs = {};

const isValidNumber = (val: string | undefined): boolean => {
    const valid: RegExp = /^[0-9]+(?:_[0-9]+)*(\.[0-9]+)?$/;

    if (
        // no undefined
        val === undefined ||
        // no empty
        val.trim() === "" ||
        // no invalid
        !valid.test(val.trim())
    ) {
        return false;
    }

    const num: number = Number.parseFloat(val);

    return !Number.isNaN(num);
};

// load env from process.env
const initProcessEnv = async (): Promise<void> => {
    for (const key in process.env) {
        // check if key is valid
        const valid: boolean = /^[a-zA-Z0-9_]+$/.test(key);

        if (!valid) continue;

        processEnv[`process.env.${key}`] = isValidNumber(process.env[key])
            ? (process.env[key] as string)
            : JSON.stringify(process.env[key]);
    }
};

// get env files
const loadProcessEnvFiles = async (): Promise<void> => {
    // declarations
    const env: string = process.env.NODE_ENV || "development";

    const envFiles: string[] = [
        ".env",
        ".env.local",
        `.env.${env}`,
        `.env.${env}.local`,
    ];

    // get content
    for (const envFile of envFiles) {
        const fullPath: string = path.join(root, envFile);

        if (
            // check if file exists
            !(await fse.exists(fullPath)) ||
            // check if it's a file
            !(await fse.stat(fullPath)).isFile()
        )
            continue;

        const content: string = await fse.readFile(fullPath, "utf-8");

        processEnvFiles.push({
            name: envFile,
            content,
        });
    }
};

// load env from env files
const loadProcessEnvFromFiles = async (): Promise<void> => {
    // get content
    for (const { content } of processEnvFiles) {
        let result: dotenv.DotenvConfigOutput = {};

        result.parsed = dotenv.parse(content);
        result = dotenvExpand.expand(result);

        for (const key in result.parsed) {
            const parsed: string = isValidNumber(result.parsed[key])
                ? result.parsed[key]
                : JSON.stringify(result.parsed[key]);

            // for dev
            process.env[key] = parsed;

            // for build and bundle
            processEnv[`process.env.${key}`] = parsed;
        }
    }
};

const logProcessEnv = async (): Promise<void> => {
    const { terminal } = await import("#/utils/terminal");

    for (const { name } of processEnvFiles) {
        terminal.info(`Environment loaded from ${name}`);
    }
};

const setProcessEnv = async (): Promise<void> => {
    await initProcessEnv();
    await loadProcessEnvFiles();
    await loadProcessEnvFromFiles();
};

const getProcessEnv = async (): Promise<Envs> => {
    // check if processEnv empty
    if (Object.keys(processEnv).length === 0) {
        await setProcessEnv();
    }

    return processEnv;
};

const loadProcessEnv = async (): Promise<void> => {
    if (process.env.NODE_ENV === "production") {
        await loadProcessEnvFiles();
        await loadProcessEnvFromFiles();
    }
};

export { setProcessEnv, logProcessEnv, getProcessEnv, loadProcessEnv };
