import type { Color } from "#/@types/color";

const colors = {
    reset: "\x1b[0m",

    // red
    redLight: "\x1b[38;5;204m",
    red: "\x1b[38;5;9m",
    redDark: "\x1b[38;5;1m",

    // yellow
    yellowLight: "\x1b[38;5;228m",
    yellow: "\x1b[38;5;221m",
    yellowDark: "\x1b[38;5;136m",

    // blue
    blueLight: "\x1b[38;5;117m",
    blue: "\x1b[38;5;39m",
    blueDark: "\x1b[38;5;69m",

    // green
    greenLight: "\x1b[38;5;49m",
    green: "\x1b[38;5;10m",
    greenDark: "\x1b[38;5;23m",

    // purple
    purpleLight: "\x1b[38;5;219m",
    purple: "\x1b[38;5;127m",
    purpleDark: "\x1b[38;5;89m",
};

const useColor = (color: keyof typeof colors, text: string): string => {
    return `${colors[color]}${text}${colors.reset}`;
};

const color: Color = {
    // red
    redLight: (val: string): string => useColor("redLight", val),
    red: (val: string): string => useColor("red", val),
    redDark: (val: string): string => useColor("redDark", val),

    // yellow
    yellowLight: (val: string): string => useColor("yellowLight", val),
    yellow: (val: string): string => useColor("yellow", val),
    yellowDark: (val: string): string => useColor("yellowDark", val),

    // blue
    blueLight: (val: string): string => useColor("blueLight", val),
    blue: (val: string): string => useColor("blue", val),
    blueDark: (val: string): string => useColor("blueDark", val),

    // green
    greenLight: (val: string): string => useColor("greenLight", val),
    green: (val: string): string => useColor("green", val),
    greenDark: (val: string): string => useColor("greenDark", val),

    // purple
    purpleLight: (val: string): string => useColor("purpleLight", val),
    purple: (val: string): string => useColor("purple", val),
    purpleDark: (val: string): string => useColor("purpleDark", val),
};

export { color };
