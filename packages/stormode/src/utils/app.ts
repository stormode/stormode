import * as fs from "node:fs";
import * as path from "node:path";

import nodemon from "nodemon";
import terminal from "stormode-terminal";

import type { Config } from "./types";

const app = (
	watch: boolean,
	src: string,
	index: string,
	config: Config | null = null,
) => {
	// declarations
	const finalPath = path.resolve(process.cwd(), src, index);

	// nodemon
	nodemon({
		script: finalPath,
		execMap: {
			ts: "ts-node",
		},
		watch: watch ? [src, ...(config?.app?.watch ?? [])] : [],
		ignore: watch ? config?.app?.ignore ?? [] : ["/*"],
	});

	nodemon
		.on("start", () => {
			terminal.info(`Starting ${finalPath}`);
		})
		.on("crash", () => {
			terminal.error("App crashed, wating for changes...");
		})
		.on("quit", () => {
			process.exit();
		})
		.on("restart", (files) => {
			terminal.info("Restarting due to changes...");
		});
};

export default app;
