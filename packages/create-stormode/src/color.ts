const colors = {
	normal: "",
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	purple: "\x1b[35m",
	cyan: "\x1b[36m",
} as const;

export type Color = (val: string) => string;

export type ColorList = keyof typeof colors;

const useColor = (color: ColorList, text: string) => {
	return `${colors[color]}${text}${colors.reset}`;
};

const color: {
	[key: string]: Color;
} = {
	normal: (val: string) => useColor("normal", val),
	red: (val: string) => useColor("red", val),
	green: (val: string) => useColor("green", val),
	yellow: (val: string) => useColor("yellow", val),
	blue: (val: string) => useColor("blue", val),
	purple: (val: string) => useColor("purple", val),
	cyan: (val: string) => useColor("cyan", val),
};

export default color;
