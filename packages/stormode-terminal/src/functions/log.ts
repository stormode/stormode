import type { Config, FullConfig, TimeConfig } from "#/@types/config";

import { getTime } from "#/functions/time";

type LogOptions = {
    title: string;
    content: unknown;
    config?: Config;
};

const defaultConfig: FullConfig = {
    mode: { mode: "terminal" },
    mute: false,
    time: false,
};

const time = (config: TimeConfig): string => {
    let type: "utc" | "local";

    if (typeof config === "boolean") {
        // false
        if (config === false) {
            return "";
        }
        // true
        else {
            type = "local";
        }
    } else {
        type = config;
    }

    return `[${getTime({ type })}]` + " ";
};

const log = (options: LogOptions): string => {
    // declarations
    const { title, content, config } = options;
    const _config: FullConfig = {
        ...defaultConfig,
        ...config,
    };

    // time
    const _time: string = time(_config.time);

    // title
    const _title: string = `[${title}]`;

    // message
    const _msg: string = `- ${_time}${_title} ${content}`;

    // mute
    if (!_config.mute) console.log(_msg);

    // result
    return _msg;
};

export type { LogOptions };
export { log };
