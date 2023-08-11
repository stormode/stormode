import color from "./utils/color";

type mode = {
	mode?: "terminal" | "string";
};

const defaultConfig: mode = {
	mode: "terminal",
};

const info = (content: any, config: mode = defaultConfig): string => {
	const header = `- [${color.blue("info")}]`;
	const message = `${header} ${content}`;

	if (!config || !config.mode || config.mode === "terminal") {
		console.log(message);
	}

	return message;
};

const wait = (content: any, config: mode = defaultConfig): string => {
	const header = `- [${color.purple("wait")}]`;
	const message = `${header} ${content}`;

	if (!config || !config.mode || config.mode === "terminal") {
		console.log(message);
	}

	return message;
};

const ready = (content: any, config: mode = defaultConfig): string => {
	const header = `- [${color.green("ready")}]`;
	const message = `${header} ${content}`;

	if (!config || !config.mode || config.mode === "terminal") {
		console.log(message);
	}

	return message;
};

const warn = (content: any, config: mode = defaultConfig): string => {
	const header = `- [${color.yellow("warn")}]`;
	const message = `${header} ${content}`;

	if (!config || !config.mode || config.mode === "terminal") {
		console.log(message);
	}

	return message;
};

const error = (content: any, config: mode = defaultConfig): string => {
	const header = `- [${color.red("error")}]`;
	const message = `${header} ${content}`;

	if (!config || !config.mode || config.mode === "terminal") {
		console.log(message);
	}

	return message;
};

const cancel = (content: any, config: mode = defaultConfig): string => {
	const header = `- [${color.redDark("cancel")}]`;
	const message = `${header} ${content}`;

	if (!config || !config.mode || config.mode === "terminal") {
		console.log(message);
	}

	return message;
};

const terminal = { info, ready, warn, error, wait, cancel, color };
export { info, ready, warn, error, wait, cancel, color };
export default terminal;
