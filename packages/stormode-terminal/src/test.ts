import terminal from ".";

for (const color in terminal.color) {
	console.log(
		(terminal.color as Record<string, (val: string) => string>)[color](
			"hello World!",
		),
	);
}

terminal.info("This is info");
terminal.wait("This is wait");
terminal.ready("This is ready");
terminal.warn("This is warn");
terminal.error("This is error");
terminal.cancel("This is cancel");
console.log(terminal.info("This is info2", { mode: "string" }));
