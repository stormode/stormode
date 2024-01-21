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

const color = {
    // red
    redLight: (val: string) => useColor("redLight", val),
    red: (val: string) => useColor("red", val),
    redDark: (val: string) => useColor("redDark", val),

    // yellow
    yellowLight: (val: string) => useColor("yellowLight", val),
    yellow: (val: string) => useColor("yellow", val),
    yellowDark: (val: string) => useColor("yellowDark", val),

    // blue
    blueLight: (val: string) => useColor("blueLight", val),
    blue: (val: string) => useColor("blue", val),
    blueDark: (val: string) => useColor("blueDark", val),

    // green
    greenLight: (val: string) => useColor("greenLight", val),
    green: (val: string) => useColor("green", val),
    greenDark: (val: string) => useColor("greenDark", val),

    // purple
    purpleLight: (val: string) => useColor("purpleLight", val),
    purple: (val: string) => useColor("purple", val),
    purpleDark: (val: string) => useColor("purpleDark", val),
};

export default color;
