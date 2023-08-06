import fs from "node:fs";
import path from "node:path";

import nodemon from "nodemon";

import type { Config } from "./types";

import color from "./color";

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

	let msg: string;

	nodemon
		.on("start", () => {
			msg = `Starting ${finalPath}`;
			console.log(`- [${color.cyan("info")}]`, msg);
		})
		.on("crash", () => {
			msg = "App crashed, wating for changes...";
			console.log(`- [${color.red("error")}]`, msg);
		})
		.on("quit", () => {
			process.exit();
		})
		.on("restart", (files) => {
			msg = "Restarting due to changes...";
			console.log(`- [${color.cyan("info")}]`, msg);
		});
};

export default app;
