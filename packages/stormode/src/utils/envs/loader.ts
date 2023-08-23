import * as path from "node:path";

import * as fse from "fs-extra";
import dotenv from "dotenv";
import terminal from "stormode-terminal";

const cwd = process.cwd();

const envLoader = async (): Promise<void> => {
	const env: string = process.env.NODE_ENV || "development";
	const envFiles: string[] = [
		".env",
		".env.local",
		`.env.${env}`,
		`.env.${env}.local`,
	];

	for (const envFile of envFiles) {
		const fullPath = path.resolve(cwd, envFile);
		if (await fse.exists(fullPath)) {
			dotenv.config({ override: true, path: fullPath });
			terminal.info(`Env loaded from ${envFile}`);
		}
	}
};

export default envLoader;
