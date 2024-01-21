import * as os from "node:os";
import * as path from "node:path";

import * as fse from "fs-extra";
import terminal from "stormode-terminal";

const cwd = process.cwd();

const importErr =
    "Unable to import the stormode config file, Please ensure that the config file exists and is in the correct format.";
const readErr =
    "Unable to read stormode config file, Please make sure you have a valid config setup or the correct format.";

const removeTemp = async (tempPath: string | null) => {
    if (!tempPath) return;
    if (await fse.exists(tempPath)) {
        await fse.rm(tempPath, { recursive: true });
    }
};

const configLoader = async (configPath: string): Promise<object | null> => {
    // not found
    if (!(await fse.exists(configPath))) {
        terminal.info("Config loaded as default");
        return null;
    }

    // declarations
    const displyName = configPath;
    let configPathRaw = path.resolve(cwd, configPath);
    let tempConfigPath: string | null = null;
    let tempConfigFile: string | null = null;

    // if typescript
    if (path.extname(configPathRaw) === ".ts") {
        const typescript = await import("typescript");
        const configFileName = path.basename(configPathRaw, ".ts");

        // create temp
        tempConfigPath = path.join(os.tmpdir(), "stormode", "config");
        await fse.mkdir(tempConfigPath, { recursive: true });

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
            await fse.readFile(configPath, "utf-8"),
            {
                compilerOptions: tsConfig.compilerOptions,
            },
        );

        // result
        await fse.writeFile(tempConfigFileCJS, tsTranspiled.outputText);

        tempConfigFile = tempConfigFileCJS;
        configPathRaw = tempConfigFile;
    }

    // import
    const configModule = await require(configPathRaw);

    if (!configModule) {
        await removeTemp(tempConfigPath);
        throw new Error(importErr);
    }

    // get module
    const config = configModule.default ?? configModule;

    if (typeof config !== "object") {
        await removeTemp(tempConfigPath);
        throw new Error(readErr);
    }

    await removeTemp(tempConfigPath);

    // result
    terminal.info(`Config loaded from ${displyName}`);
    return config;
};

export default configLoader;
