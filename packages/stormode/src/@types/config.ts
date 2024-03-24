import type { Options as SwcOptions } from "@swc/core";
import type { BuildOptions } from "esbuild";

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
     * swc config to override the preset
     * @see https://swc.rs/docs/configuration/compilation
     * @default {}
     */
    swc: Omit<SwcOptions, "sourceMaps" | "inlineSourcesContent" | "outputPath">;
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
     * @deprecated
     * @use esbuild.platform
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
    /**
     * esbuild config to override the preset
     * @see https://esbuild.github.io/api
     * @default {}
     */
    esbuild: Omit<
        BuildOptions,
        "entryPoints" | "bundle" | "minify" | "sourcemap"
    >;
};

type Config = Partial<
    BaseConfig & {
        server: Partial<ServerConfig>;
        build: Partial<BuildConfig>;
    }
>;

type FullConfig = BaseConfig & {
    server: ServerConfig;
    build: BuildConfig;
};

export type { Config, FullConfig };
