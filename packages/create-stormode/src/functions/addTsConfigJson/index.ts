import * as path from "node:path";

import * as fse from "fs-extra";

type AddTsConfigJson = {
    projectRoot: string;
};

const addTsConfigJson = async (options: AddTsConfigJson): Promise<void> => {
    const tsconfigJson = {
        compilerOptions: {
            target: "ES2021",
            useDefineForClassFields: true,
            module: "CommonJS",
            moduleResolution: "Node10",
            baseUrl: ".",
            paths: {
                "#/*": ["./src/*"],
            },
            resolveJsonModule: true,
            noEmit: true,
            isolatedModules: true,
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            strict: true,
            alwaysStrict: true,
            skipLibCheck: true,
        },
        include: ["src/**/*"],
    };

    const tsconfigJsonData: string = JSON.stringify(tsconfigJson, null, 4);

    await fse.writeFile(
        path.join(options.projectRoot, "tsconfig.json"),
        tsconfigJsonData,
    );
};

export { addTsConfigJson };
