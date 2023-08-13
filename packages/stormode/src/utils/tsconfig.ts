import * as fs from "node:fs";
import * as path from "node:path";

import terminal from "stormode-terminal";

type TsConfig = {
	compilerOptions: {
		strict?: boolean;
		alwaysStrict?: boolean;
		rootDir?: string;
		outDir?: string;
		module?: string;
		target?: string;
		moduleResolution?: string;
		esModuleInterop?: boolean;
		skipLibCheck?: boolean;
		declaration?: boolean;
	};
	"ts-node": {
		require: string[];
	};
};

const tsConfig = async (): Promise<TsConfig | null> => {
	try {
		// declarations
		const jsonPath: string = path.resolve(process.cwd(), "tsconfig.json");

		if (fs.existsSync(jsonPath)) {
			return require(jsonPath);
		} else {
			return null;
		}
	} catch (err: any) {
		terminal.error(err.message);
		return null;
	}
};

export default tsConfig;
