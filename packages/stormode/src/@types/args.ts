type GlobalArgs = {
    config: string;
    withTime: "utc" | "local" | "";
};

type DevArgsBase = {
    rootDir: string;
    outDir: string;
    index: string;
    tsconfig: string;
};

type BuildArgsBase = {
    env: string;
    rootDir: string;
    outDir: string;
    index: string;
    platform: "node" | "browser";
    bundle: boolean;
    minify: boolean;
    sourceMap: boolean;
    tsconfig: string;
};

type PreviewArgsBase = {
    outDir: string;
    index: string;
};

type DevArgs = GlobalArgs & DevArgsBase;

type BuildArgs = GlobalArgs & BuildArgsBase;

type PreviewArgs = GlobalArgs & PreviewArgsBase;

export type { DevArgs, BuildArgs, PreviewArgs };
