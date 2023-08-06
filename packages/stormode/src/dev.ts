import fs from "node:fs";
import path from "node:path";

import type { Config } from "./utils/types";

import app from "./utils/app";
import tsCheck from "./utils/tscheck";
import tsConfig from "./utils/tsconfig";

// watch changes
const dev = async (config?: Config): Promise<void> => {
	// declarations
	const tsCheckResult = await tsCheck(config);
	const tsconfig = await tsConfig();
	const src: string =
		config?.dev?.src ??
		(tsCheckResult ? tsconfig?.compilerOptions?.rootDir ?? "src" : "src");
	const dfIndex: string = fs.existsSync(
		path.resolve(process.cwd(), src, "index.ts"),
	)
		? "index.ts"
		: "index.js";
	const index: string = config?.dev?.index ?? dfIndex;

	// server
	app(true, src, index, config);
};

export default dev;
