import type { Color } from "#/@types/color";
import type { Config } from "#/@types/config";

type Log = (content: unknown, config?: Config) => string;

type Logs = {
    info: Log;
    ready: Log;
    warn: Log;
    error: Log;
    wait: Log;
    cancel: Log;
};

type Terminal = Logs & {
    withConfig: (config: Config) => Logs;
    custom: (options: CustomLogOptions) => Log;
    color: Color;
};

type CustomLogOptions = {
    title: string;
    config: Config;
    content?: unknown;
};

export type { Log, Logs, Terminal, CustomLogOptions };
