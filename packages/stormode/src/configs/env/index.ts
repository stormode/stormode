import type { TimeConfig } from "stormode-terminal/dist/@types/config";

import * as path from "node:path";

const isDev = (): boolean => process.env.NODE_ENV === "development";
const isPrd = (): boolean => process.env.NODE_ENV === "production";
const terminalTime = (): TimeConfig => {
    switch (process.env.STORMODE_TIME) {
        case "1":
        case "local":
            return "local";
        case "utc":
            return "utc";
        default:
            return false;
    }
};

const cwd: string = process.cwd();
const root: string = path.resolve(cwd);
const cache: string = path.resolve(cwd, "node_modules", ".stormode");

export { isDev, isPrd, terminalTime, cwd, root, cache };
