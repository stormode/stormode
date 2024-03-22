import type { Config as SwcConfig } from "@swc/core";
import type { Config as JestConfig } from "jest";

const config: SwcConfig = {
    jsc: {
        keepClassNames: true,
        preserveAllComments: true,
        transform: {
            react: {
                runtime: "automatic",
            },
        },
    },
};

export default {
    rootDir: process.cwd(),
    testMatch: ["<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}"],
    moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
    transform: {
        "^.+\\.[tj]sx?$": [
            "@swc/jest",
            {
                ...config,
            },
        ],
    },
} as JestConfig;
