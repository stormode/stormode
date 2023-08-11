import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import terminal from "stormode-terminal";

import type { Config } from "./utils/types";

import dev from "./dev";
import build from "./build";
import preview from "./preview";

const main = async (): Promise<void> => {
	// declarations
	let isPreview = false;
	let configPath: string = path.resolve(process.cwd(), "stormode.config.js");
	let config: Config | null = null;

	const run = async (env: string, config?: Config): Promise<void> => {
		if (env === "production") {
			return await build(config);
		}
		return dev(config);
	};

	const tsConfigPath: string = path.resolve(
		process.cwd(),
		"stormode.config.ts",
	);

	if (fs.existsSync(tsConfigPath)) {
		configPath = tsConfigPath;
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
				configPath = path.resolve(process.cwd(), valNext);
				break;
		}
	}

	try {
		// check config
		if (fs.existsSync(configPath)) {
			config = await require(configPath);

			const er1 = "Unable to import the stormode config file,";
			const er2 =
				"Please ensure that the config file exists and is in the correct format.";
			const er3 = "Unable to read stormode config file,";
			const er4 =
				"Please make sure you have a valid config setup or the correct format.";

			if (!config) {
				terminal.error(er1);
				terminal.error(er2);
				throw new Error();
			}

			if (typeof config !== "object") {
				terminal.error(er3);
				terminal.error(er4);
				throw new Error();
			}

			terminal.info(`Config loaded from ${configPath}`);
		} else {
			terminal.info("Config loaded as default");
		}

		// preview mode
		if (isPreview) return preview(config);

		// declarations 2
		const env = process.env.NODE_ENV || "development";

		// .env
		dotenv.config({
			override: true,
		});
		terminal.info("Env loaded from .env");

		// .env.development / .env.production
		const env2 = path.resolve(process.cwd(), `.env.${env}`);

		if (fs.existsSync(env2)) {
			dotenv.config({
				override: true,
				path: env2,
			});
			terminal.info(`Env loaded from .env.${env}`);
		}

		// .env.local.development / .env.local.production
		const env3 = path.resolve(process.cwd(), `.env.${env}.local`);

		if (fs.existsSync(env3)) {
			dotenv.config({
				override: true,
				path: env3,
			});
			terminal.info(`Env loaded from .env.${env}.local`);
		}

		if (config && config) return run(env, config);

		return run(env);
	} catch (err) {
		console.log(err);
		return;
	}
};

main();

export type { Config };
