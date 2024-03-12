/**
 * @deprecated
 * @use mute
 */
type Mode = {
    mode?: "terminal" | "string";
};

type TimeConfig = "utc" | "local" | boolean;

type _Config = {
    /**
     * @deprecated
     * @use mute
     */
    mode: Mode;
    /**
     * @description mute the output to console
     * @default false
     */
    mute: boolean;
    /**
     * @description terminal with time
     * @default false
     */
    time: TimeConfig;
};

type FullConfig = _Config;
type Config = Partial<_Config>;

export type { Mode, TimeConfig, Config, FullConfig };
