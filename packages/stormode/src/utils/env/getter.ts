import type { envs } from "#/@types/env";

const envGetter = async (): Promise<envs> => {
    const envs: envs = {};

    // put envs
    for (const p in process.env) {
        // unacceptable parameters
        if (p === "CommonProgramFiles(x86)" || p === "ProgramFiles(x86)") {
            continue;
        }
        envs[`process.env.${p}`] = JSON.stringify(process.env[p]);
    }

    return envs;
};

export { envGetter };
