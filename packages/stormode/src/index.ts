import * as fs from "node:fs";
import * as path from "node:path";

import dotenv from "dotenv";
import terminal from "stormode-terminal";

import type { Config } from "./utils/types";

import dev from "./dev";
import build from "./build";
import preview from "./preview";

import configLoader from "./utils/configLoader";

const run = async (env: string, config?: Config): Promise<void> => {
	if (env === "production") {
		return await build(config);
	}
	return dev(config);
};

const main = async (): Promise<void> => {
	// declarations
	let isPreview = false;
	let config: Config | null = null;

	// path start at root
	const configJsPath: string = "stormode.config.js";
	const configCjsPath: string = "stormode.config.cjs";
	const configTsPath: string = "stormode.config.ts";

	let configPath: string = configJsPath;

	// stormode.config.cjs
	const configMjsPathRaw: string = path.resolve(process.cwd(), configCjsPath);

	if (fs.existsSync(configMjsPathRaw)) {
		configPath = configCjsPath;
	}

	// stormode.config.ts
	const configTsPathRaw: string = path.resolve(process.cwd(), configTsPath);

	if (fs.existsSync(configTsPathRaw)) {
		configPath = configTsPath;
	}

	// argument loop
	for (let i = 0; i < process.argv.length; i++) {
		const val = process.argv[i];
		const valNext = process.argv[i + 1];
		switch (val) {
			case "dev":
				process.env.NODE_ENV = "development";
				break;
			case "build":
				process.env.NODE_ENV = "production";
				break;
			case "preview":
				isPreview = true;
				break;
			case "--config":
			case "-c":
				configPath = valNext;
				break;
		}
	}

	try {
		// check config
		config = await configLoader(configPath);

		// preview mode
		if (isPreview) return preview(config);

		// env
		const env: string = process.env.NODE_ENV || "development";
		const envFiles: string[] = [".env", `.env.${env}`, `.env.${env}.local`];

		for (const envFile of envFiles) {
			const fullPath = path.resolve(process.cwd(), envFile);
			if (fs.existsSync(fullPath)) {
				dotenv.config({ override: true, path: fullPath });
				terminal.info(`Env loaded from ${envFile}`);
			}
		}

		if (config) return run(env, config);

		return run(env);
	} catch (err) {
		console.log(err);
		return;
	}
};

main();

export type { Config };
