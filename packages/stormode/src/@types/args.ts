type GlobalArgs = {
    config?: string;
};

type DevArgs = GlobalArgs & {
    rootDir?: string;
    outDir?: string;
    index?: string;
    tsconfig?: string;
};

type BuildArgs = GlobalArgs & {
    env?: string;
    rootDir?: string;
    outDir?: string;
    index?: string;
    platform?: string;
    bundle?: boolean;
    minify?: boolean;
    sourcemap?: boolean;
    tsconfig?: string;
};

type PreviewArgs = GlobalArgs & {
    outDir?: string;
    index?: string;
};

export type { DevArgs, BuildArgs, PreviewArgs };
