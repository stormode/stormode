import fs from "node:fs";
import path from "node:path";

import type { Config } from "./utils/types";

import app from "./utils/app";

const preview = async (config: Config | null = null): Promise<void> => {
	// declarations
	const dist: string = config?.build?.dist ?? "dist";
	let index: string = config?.dev?.index ?? "index.js";

	// change extension
	if (index.endsWith(".ts")) {
		index = index.replace(".ts", ".js");
	}

	// server
	app(false, dist, index, config);
};

export default preview;
