import type { EnvConfig, JscConfig, ModuleConfig } from "@swc/core";

/**
 * swc config
 */
type SwcConfig = {
    env: EnvConfig;
    jsc: JscConfig;
    module: ModuleConfig;
};

/**
 * Base config
 */
type BaseConfig = {
    /**
     * Use terminal with time
     * @default false
     */
    withTime: "utc" | "local" | boolean;
    /**
     * The directory of the source code
     * @default "src"
     */
    rootDir: string;
    /**
     * The index file of the source code
     * @default "index.ts" | "index.js"
     */
    index: string;
    /**
     * The directory of the output
     * @default "dist"
     */
    outDir: string;
    /**
     * The path of `tsconfig.json`
     * @default "tsconfig.json"
     */
    tsconfig: string;
    /**
     * swc config
     * @see https://swc.rs/docs/configuration/compilation
     * @default {}
     */
    swc: Partial<SwcConfig>;
};

/**
 * Server config
 */
type ServerConfig = {
    /**
     * Directories to monitor other than rootDir
     * @default []
     */
    watch: string[];
    /**
     * Directories to ignore based on watch
     * @default []
     */
    ignore: string[];
};

/**
 * Build config
 */
type BuildConfig = {
    /**
     * Target platform to build
     * @see https://esbuild.github.io/api/#platform
     * @default "node"
     */
    platform: "node" | "browser";
    /**
     * Bundle all the files into one
     * @default false
     */
    bundle: boolean;
    /**
     * Minify the code
     * @default false
     */
    minify: boolean;
    /**
     * @deprecated
     * @use sourceMap
     */
    sourcemap: boolean;
    /**
     * Generate source map on build
     * @default false
     */
    sourceMap: boolean;
    /**
     * @deprecated
     * @use tsconfig from base config
     */
    tsconfig: string;
};

type Config = Partial<
    BaseConfig & {
        server: Partial<ServerConfig>;
        build: Partial<BuildConfig>;
    }
>;

type ImpartialConfig = BaseConfig & {
    server: ServerConfig;
    build: BuildConfig;
};

export type { Config, ImpartialConfig };
