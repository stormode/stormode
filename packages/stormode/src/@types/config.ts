/**
 * base configs
 */
type BaseConfig = {
    /**
     * @description terminal with time
     * @default false
     */
    withTime: "utc" | "local" | boolean;
    /**
     * @description input directory
     * @default "src"
     */
    rootDir: string;
    /**
     * @description output directory
     * @default ".stormode"
     */
    outDir: string;
    /**
     * @description index file
     * @default "index.ts" | "index.js"
     */
    index: string;
    /**
     * @description tsconfig.json path
     * @default "tsconfig.json"
     */
    tsconfig: string;
};

/**
 * server configs
 */
type ServerConfig = {
    /**
     * @description directories / files to monitor other than rootDir
     * @default []
     */
    watch: string[];
    /**
     * @description files to ignore based on watch
     * @default []
     */
    ignore: string[];
};

/**
 * build configs
 */
type BuildConfig = {
    /**
     * @description platform
     * @default "node"
     */
    platform: "node" | "browser";
    /**
     * @description bundle code
     * @default false
     */
    bundle: boolean;
    /**
     * @description minify code
     * @default false
     */
    minify: boolean;
    /**
     * @deprecated
     * @use sourceMap
     */
    sourcemap: boolean;
    /**
     * @description generate sourcemap on build
     * @default false
     */
    sourceMap: boolean;
    /**
     * @description tsconfig.json path with higer priority
     * @default "tsconfig.json"
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
