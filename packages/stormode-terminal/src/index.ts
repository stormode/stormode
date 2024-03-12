import type { Color, ColorFunction } from "#/@types/color";
import type { Config } from "#/@types/config";
import type { Terminal, Logs, Log, CustomLogOptions } from "#/@types/terminal";

import { log } from "#/functions/log";

import { color } from "#/utils/color";

const info = (content: unknown, config?: Config): string => {
    const title: string = color.blue("info");
    return log({ title, content, config });
};

const wait = (content: unknown, config?: Config): string => {
    const title: string = color.purple("wait");
    return log({ title, content, config });
};

const ready = (content: unknown, config?: Config): string => {
    const title: string = color.green("ready");
    return log({ title, content, config });
};

const warn = (content: unknown, config?: Config): string => {
    const title: string = color.yellow("warn");
    return log({ title, content, config });
};

const error = (content: unknown, config?: Config): string => {
    const title: string = color.red("error");
    return log({ title, content, config });
};

const cancel = (content: unknown, config?: Config): string => {
    const title: string = color.redDark("cancel");
    return log({ title, content, config });
};

const withConfig = (config: Config): Logs => {
    const _config: Config = config;
    return {
        info: (content: unknown, config?: Config): string =>
            info(content, { ..._config, ...config }),
        ready: (content: unknown, config?: Config): string =>
            ready(content, { ..._config, ...config }),
        warn: (content: unknown, config?: Config): string =>
            warn(content, { ..._config, ...config }),
        error: (content: unknown, config?: Config): string =>
            error(content, { ..._config, ...config }),
        wait: (content: unknown, config?: Config): string =>
            wait(content, { ..._config, ...config }),
        cancel: (content: unknown, config?: Config): string =>
            cancel(content, { ..._config, ...config }),
    };
};

const custom = (options: CustomLogOptions): Log => {
    return (content: unknown, config?: Config): string => {
        return log({
            title: options.title,
            content: content ?? options.content,
            config: { ...options.config, ...config },
        });
    };
};

const terminal: Terminal = {
    info,
    ready,
    warn,
    error,
    wait,
    cancel,
    withConfig,
    custom,
    color,
};

export type {
    Terminal,
    Config,
    Logs,
    Log,
    CustomLogOptions,
    Color,
    ColorFunction,
};
export default terminal;
export { info, wait, ready, warn, error, cancel, withConfig, custom, color };
