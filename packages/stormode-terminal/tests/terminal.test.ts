import { describe, expect, it } from "@jest/globals";

import terminal, { type Log, type Logs } from "../dist/index";

const removeColor = (val: string): string => {
    return val.replace(
        // biome-ignore lint: remove color
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        "",
    );
};

describe("terminal", (): void => {
    it("should be defined", (): void => {
        expect(terminal).toBeDefined();
    });
});

describe("terminal.info", (): void => {
    it("should be defined", (): void => {
        expect(terminal.info).toBeDefined();
    });

    const msg: string = removeColor(terminal.info("hello", { mute: true }));

    it("should return a message", (): void => {
        expect(msg).toBe("- [info] hello");
    });
});

describe("terminal.withConfig", (): void => {
    it("should be defined", (): void => {
        expect(terminal.withConfig).toBeDefined();
    });

    const wcf: Logs = terminal.withConfig({ mute: true });

    it("should return an object with log functions", (): void => {
        expect(typeof wcf === "object").toBe(true);

        expect(typeof wcf.info === "function").toBe(true);
    });

    it("should return a message in child log functions", (): void => {
        const msg: string = removeColor(terminal.info("hello", { mute: true }));
        expect(msg).toBe("- [info] hello");
    });
});

describe("terminal.custom", (): void => {
    it("should be defined", (): void => {
        expect(terminal.custom).toBeDefined();
    });

    const ctFn: Log = terminal.custom({
        title: "test",
        config: {
            mute: true,
        },
    });

    it("should return a log function", (): void => {
        expect(typeof ctFn === "function").toBe(true);
    });

    it("should return a message", (): void => {
        const msg: string = removeColor(ctFn("hello"));
        expect(msg).toBe("- [test] hello");
    });
});
