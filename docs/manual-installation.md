# Manual Installation

If you prefer a more hands-on installation process, you can follow the step below.

First of all, install the `stormode` dependency:

```bash
# npm
npm install -D stormode

# pnpm
pnpm add -D stormode
```

If you are using TypeScript, make sure to install the necessary dependencies as well:

```bash
# npm
npm install -D typescript @types/node

# pnpm
pnpm add -D typescript @types/node
```

After installing the dependencies, add the `tsconfig.json` to the root of your project.

Next, add the compiler options to `tsconfig.json`. You can follow the setup below or customize it according to your preferences:

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"useDefineForClassFields": true,
		"module": "CommonJS",
		"moduleResolution": "Node10",
		"baseUrl": ".",
		"paths": {
			"#/*": ["src/*"]
		},
		"resolveJsonModule": true,
		"noEmit": true,
        "isolatedModules": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"strict": true,
		"alwaysStrict": true,
		"skipLibCheck": true
	},
	"include": ["src/**/*"]
}
```

After installing dependencies (and `tsconfig.json` configuration), you may add Stormode scripts into `package.json` to run you project.

```json
{
	"scripts": {
		"dev": "stormode dev",
		"build": "stormode build",
		"preview": "stormode preview"
	}
}
```

If you are using TypeScript, you may do type checking before the build by replacing the build command with the following:

```bash
tsc && stormode build
```

Then start your project in development mode with this command:

```bash
# npm
npm run dev

# pnpm
pnpm run dev
```
