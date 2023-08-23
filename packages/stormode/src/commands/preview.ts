import type { ImpartialConfig } from "../@types/config";

import * as path from "node:path";
import * as childProcess from "node:child_process";

import * as fse from "fs-extra";
import terminal from "stormode-terminal";

const cwd = process.cwd();
let runCode: childProcess.ChildProcess | null = null;

const preview = async (config: ImpartialConfig): Promise<void> => {
	const outDir = path.resolve(cwd, config.outDir, "dist");
	const index = config.index.replace(".ts", ".js");
	const outPath = path.join(outDir, index);

	// check if dir exists
	if (!(await fse.exists(outDir))) {
		throw new Error("Unable to find the build directory");
	}

	// execfile
	const executeFile = () => {
		terminal.info("Starting...");

		if (runCode) {
			runCode.kill();
		}

		runCode = childProcess.spawn("node", [outPath]);

		runCode.stdout &&
			runCode.stdout.on("data", (data) => {
				const output: string = data.toString().trim();
				if (output.length > 0) {
					console.log(output);
				}
			});

		runCode.stderr &&
			runCode.stderr.on("data", (data) => {
				const output: string = data.toString().trim();
				if (output.length > 0) {
					console.log(output);
				}
				terminal.error("Crashed, maybe something went wrong...?");
			});
	};

	executeFile();
};

export default preview;
