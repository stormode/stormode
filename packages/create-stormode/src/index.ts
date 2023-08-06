import fs from "node:fs";
import path from "node:path";

import prompts from "prompts";
import fetch from "npm-registry-fetch";

import color, { Color } from "./color";

type Variant = {
	title: string;
	value: string;
	color: Color;
};

type Framework = {
	title: string;
	value: string;
	color: Color;
	variants?: Variant[];
};

type FwChoice = {
	title: string;
	value: Framework;
};

type VrChoice = {
	title: string;
	value: string;
};

type Answers = prompts.Answers<"name" | "framework" | "variant">;

const frameworks: Framework[] = [
	{
		title: "Vanilla",
		value: "vanilla",
		color: color.green,
		variants: [
			{
				title: "Vanilla + TypeScript",
				value: "ts",
				color: color.blue,
			},
			{
				title: "Vanilla + JavaScript",
				value: "js",
				color: color.yellow,
			},
		],
	},
	{
		title: "Express",
		value: "express",
		color: color.yellow,
		variants: [
			{
				title: "Express + TypeScript",
				value: "ts",
				color: color.blue,
			},
			{
				title: "Express + JavaScript",
				value: "js",
				color: color.yellow,
			},
		],
	},
	{
		title: "Koa",
		value: "koa",
		color: color.purple,
		variants: [
			{
				title: "Koa + TypeScript",
				value: "ts",
				color: color.blue,
			},
			{
				title: "Koa + JavaScript",
				value: "js",
				color: color.yellow,
			},
		],
	},
];

const getFramework = () => {
	const choices: FwChoice[] = [];
	frameworks.map((fw) => {
		choices.push({
			title: fw.color(fw.title),
			value: fw,
		});
	});
	return choices;
};

const getVariant = (fw: Framework) => {
	const choices: VrChoice[] = [];
	fw.variants &&
		fw.variants.map((variant) => {
			choices.push({
				title: variant.color(variant.title),
				value: variant.value,
			});
		});
	return choices;
};

type PkgResponse = {
	"dist-tags": {
		latest: string;
		[tag: string]: string;
	};
};

const lastVer = async (name: string): Promise<string> => {
	const registryUrl = "https://registry.npmjs.org/";
	const packageUrl = `${registryUrl}${name}`;

	try {
		const response = (await fetch.json(packageUrl)) as PkgResponse;
		const latestVersion = response["dist-tags"]["latest"];
		return latestVersion;
	} catch (error: any) {
		const ermsg = `Failed to get the latest version of ${name}`;
		throw new Error(`- [${color.red("error")}] ${ermsg}`);
	}
};

const pkgLastVer = async (name: string): Promise<string> => {
	return "^" + (await lastVer(name));
};

const copyAll = async (source: string, target: string): Promise<void> => {
	if (!fs.existsSync(target)) {
		fs.mkdirSync(target, { recursive: true });
	}

	const files = fs.readdirSync(source);

	for (const file of files) {
		const cSource = path.join(source, file);
		const cTarget = path.join(target, file);
		const stat = fs.statSync(cSource);

		if (stat.isDirectory()) {
			copyAll(cSource, cTarget);
		} else {
			fs.copyFileSync(cSource, cTarget);
		}
	}
};

const main = async (): Promise<void> => {
	try {
		// welcome message
		const wcmsg = `Welcome to ${color.cyan("Stormode")}`;
		const wcmsg2 = "A powerful build tool for Node";
		console.log(`- [${color.cyan("info")}] ${wcmsg}`);
		console.log(`- [${color.cyan("info")}] ${wcmsg2}`);

		// get answers
		const answers: Answers = await prompts(
			[
				{
					type: "text",
					name: "name",
					message: "Project name:",
					initial: "stormode-project",
				},
				{
					type: "select",
					name: "framework",
					message: "Select a framework:",
					choices: getFramework(),
				},
				{
					type: (fw: Framework) => {
						return fw && (fw.variants ? "select" : null);
					},
					name: "variant",
					message: "Select a variant:",
					choices: (fw: Framework) => getVariant(fw),
				},
			],
			{
				onCancel: () => {
					const err = "Installation canceled";
					throw new Error(`- [${color.red("cancel")}] ${err}`);
				},
			},
		);

		console.log(`- [${color.cyan("info")}] Creating project...`);

		// name: any;
		// framework: vanilla | express | koa;
		// variant: ts | js;
		const name: string = answers.name.toLowerCase();
		const framework: string = answers.framework.value;
		const variant: string = answers.variant;

		const isExpress: boolean = framework === "express";
		const isKoa: boolean = framework === "koa";
		const isTs: boolean = variant === "ts";

		const packageDir: string = path.resolve(__dirname, "..");
		let targetDir: string = path.resolve(process.cwd(), name);
		let counter: number = 2;
		let existmsg: string;
		let existmsg2: string;

		while (fs.existsSync(targetDir)) {
			targetDir = path.resolve(process.cwd(), name + `-${counter}`);
			existmsg2 = `project renamed to (${name}-${counter})`;
			if (counter > 2) {
				existmsg = `Folder (${name}-${counter - 1}) already exists`;
			} else {
				existmsg = `Folder (${name}) already exists`;
			}
			console.log(`- [${color.cyan("info")}] ${existmsg}, ${existmsg2}`);
			counter++;
		}

		fs.mkdirSync(targetDir);

		console.log(`- [${color.cyan("info")}] Fetching dependencies data...`);

		const dependencies = {
			// express
			...(isExpress
				? {
						express: await pkgLastVer("express"),
						cors: await pkgLastVer("cors"),
						"cookie-parser": await pkgLastVer("cookie-parser"),
				  }
				: {}),
			// koa
			...(isKoa
				? {
						koa: await pkgLastVer("koa"),
						"koa-router": await pkgLastVer("koa-router"),
				  }
				: {}),
		};

		const tsDevDependencies = {
			// express
			...(isExpress
				? {
						"@types/express": await pkgLastVer("@types/express"),
						"@types/cors": await pkgLastVer("@types/cors"),
						"@types/cookie-parser": await pkgLastVer(
							"@types/cookie-parser",
						),
				  }
				: {}),
			// koa
			...(isKoa
				? {
						"@types/koa": await pkgLastVer("@types/koa"),
						"@types/koa-router": await pkgLastVer(
							"@types/koa-router",
						),
				  }
				: {}),
			"@types/node": await pkgLastVer("@types/node"),
			"ts-node": await pkgLastVer("ts-node"),
			typescript: await pkgLastVer("typescript"),
		};

		const packageJson = {
			name: name,
			version: "1.0.0",
			private: true,
			scripts: {
				dev: "stormode dev",
				build: "stormode build",
				preview: "stormode preview",
			},
			dependencies: dependencies,
			devDependencies: {
				...(isTs ? tsDevDependencies : {}),
				stormode: await pkgLastVer("stormode"),
			},
		};

		const tsconfigJson = {
			compilerOptions: {
				strict: true,
				alwaysStrict: true,
				rootDir: "./src",
				outDir: "./dist",
				module: "commonjs",
				target: isKoa ? "es6" : "es5",
				moduleResolution: "node",
				esModuleInterop: true,
				resolveJsonModule: true,
				skipLibCheck: true,
				baseUrl: ".",
				paths: {
					"@/*": ["./src/*"],
				},
			},
			"ts-node": {
				require: ["tsconfig-paths/register"],
			},
		};

		// package.json
		const packageJsonData: string = JSON.stringify(packageJson, null, 4);
		fs.writeFileSync(path.join(targetDir, "package.json"), packageJsonData);

		// tsconfig.json
		if (isTs) {
			const tsconfigJsonData: string = JSON.stringify(
				tsconfigJson,
				null,
				4,
			);
			fs.writeFileSync(
				path.join(targetDir, "tsconfig.json"),
				tsconfigJsonData,
			);
		}

		console.log(`- [${color.cyan("info")}] Creating files...`);

		// copy default files
		const templateDefault = path.resolve(
			packageDir,
			"templates",
			"default",
		);

		fs.copyFileSync(
			path.join(templateDefault, "_gitignore"),
			path.join(targetDir, ".gitignore"),
		);

		fs.copyFileSync(
			path.join(templateDefault, ".env.development"),
			path.join(targetDir, ".env.development"),
		);

		fs.copyFileSync(
			path.join(templateDefault, ".env.production"),
			path.join(targetDir, ".env.production"),
		);

		fs.copyFileSync(
			path.join(templateDefault, "stormode.config.js"),
			path.join(targetDir, "stormode.config.js"),
		);

		// copy template files
		let template: string = path.resolve(
			packageDir,
			"templates",
			"vanilla",
			"js",
		);

		if (
			framework === "vanilla" ||
			framework === "express" ||
			framework === "koa"
		) {
			template = path.resolve(
				packageDir,
				"templates",
				framework,
				variant,
			);
		}

		await copyAll(template, targetDir);

		// done
		console.log(`- [${color.green("ready")}] Project created successfully`);
	} catch (err: any) {
		console.log(err.message);
		return;
	}
};

main();
