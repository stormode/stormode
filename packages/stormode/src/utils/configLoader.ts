import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";

import terminal from "stormode-terminal";

const er1 = "Unable to import the stormode config file,";
const er2 =
	"Please ensure that the config file exists and is in the correct format.";
const er3 = "Unable to read stormode config file,";
const er4 =
	"Please make sure you have a valid config setup or the correct format.";

const removeTemp = (tempPath: string | null) => {
	try {
		if (!tempPath) return;
		if (fs.existsSync(tempPath)) {
			fs.rmSync(tempPath, { recursive: true });
		}
	} catch (err: any) {
		terminal.error(err.message);
	}
};

const configLoader = async (configPath: string): Promise<object | null> => {
	// not found
	if (!fs.existsSync(configPath)) {
		terminal.info("Config loaded as default");
		return null;
	}

	// declarations
	const displyName = configPath;
	let configPathRaw = path.resolve(process.cwd(), configPath);
	let tempConfigPath: string | null = null;
	let tempConfigFile: string | null = null;

	// if typescript
	if (path.extname(configPathRaw) === ".ts") {
		const typescript = await import("typescript");
		const configFileName = path.basename(configPathRaw, ".ts");

		// create temp
		tempConfigPath = path.join(os.tmpdir(), "stormode", "temp");
		await fsp.mkdir(tempConfigPath, { recursive: true });

		// temp file path
		const tempConfigFileCJS = path.join(
			tempConfigPath,
			`${configFileName}.cjs`,
		);

		// typescript config
		const tsConfig = {
			compilerOptions: {
				target: typescript.ScriptTarget.ES5,
				module: typescript.ModuleKind.CommonJS,
			},
		};

		// transpile
		const tsTranspiled = typescript.transpileModule(
			await fsp.readFile(configPath, "utf-8"),
			{
				compilerOptions: tsConfig.compilerOptions,
			},
		);

		// result
		await fsp.writeFile(tempConfigFileCJS, tsTranspiled.outputText);

		tempConfigFile = tempConfigFileCJS;
		configPathRaw = tempConfigFile;
	}

	// import
	const configModule = await require(configPathRaw);

	if (!configModule) {
		removeTemp(tempConfigPath);
		terminal.error(er1);
		terminal.error(er2);
		throw new Error();
	}

	// get module
	const config = configModule.default ?? configModule;

	if (typeof config !== "object") {
		removeTemp(tempConfigPath);
		terminal.error(er3);
		terminal.error(er4);
		throw new Error();
	}

	removeTemp(tempConfigPath);

	// result
	terminal.info(`Config loaded from ${displyName}`);
	return config;
};

export default configLoader;
