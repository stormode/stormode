import type { Config } from "jest";

const config: Config = {
    verbose: true,
    preset: "ts-jest",
    testMatch: ["<rootDir>/tests/**/*.test.{js,ts,jsx,tsx}"],
    transform: {
        "^.+\\.[tj]sx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.json",
            },
        ],
    },
};

export default config;
