import { exec } from "child_process";

import terminal from "stormode-terminal";

const exe = async (
	command: string,
	withStdout: boolean = false,
): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		const process = exec(command);

		// stdout
		withStdout &&
			process.stdout &&
			process.stdout.on("data", (data) => {
				const output: string = data.toString().trim();
				if (output.length > 0) {
					terminal.info(output);
				}
			});

		// error
		process.stderr &&
			process.stderr.on("data", (data) => {
				const output: string = data.toString().trim();
				if (output.length > 0) {
					terminal.error(output);
				}
			});

		// exit
		process.on("exit", (code) => {
			resolve();
		});

		// error handling for the process
		process.on("error", (err: Error) => {
			terminal.error("Error executing the command:");
			console.log(err.message);
			reject(err);
		});
	});
};

export default exe;
