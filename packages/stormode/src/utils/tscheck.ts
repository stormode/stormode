import * as fs from "node:fs";
import * as path from "node:path";

import type { Config } from "./types";
import tsConfig from "./tsconfig";

const tsCheck = async (config: Config | null = null): Promise<boolean> => {
	// declarations
	const tsconfig = await tsConfig();
	const src: string =
		config?.dev?.src ?? tsconfig?.compilerOptions.rootDir ?? "src";
	const index = config?.dev?.index;

	// check index in config
	if (index && index.endsWith(".ts")) {
		return true;
	}

	// check from file
	if (fs.existsSync(path.resolve(process.cwd(), src, "index.ts"))) {
		return true;
	} else {
		return false;
	}
};

export default tsCheck;
