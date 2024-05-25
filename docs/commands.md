# Built-in Commands

Each Stormode command comes with its own set of options, which can be used to customize the behavior of the command.

## development server

Launch a development server that automatically restarts on file changes.

```bash
stormode dev
```

| param                                         | description        |
| --------------------------------------------- | ------------------ |
| -c, --config <directory + file>               | config file path   |
| -withtime, --withTime, --withTime <utc/local> | terminal with time |
| --rootdir, --rootDir <directory>              | input directory    |
| --outdir, --outDir <directory>                | output directory   |
| --index <file>                                | index file name    |
| --tsconfig <directory + file>                 | tsconfig.json path |

`package.json` example:

```json
{
	"scripts": {
		"dev": "stormode dev",
		"dev2": "stormode dev --config anyname.ts",
		"dev3": "stormode dev --tsconfig packages/child/tsconfig.json"
	}
}
```

## build project

Build your project for production or any other environments:

```bash
stormode build
```

| param                                         | description        |
| --------------------------------------------- | ------------------ |
| -c, --config <directory + file>               | config file path   |
| -withtime, --withTime, --withTime <utc/local> | terminal with time |
| -e, --env <name>                              | environment name   |
| --rootdir, --rootDir <directory>              | input directory    |
| --outdir, --outDir <directory>                | output directory   |
| --index <file>                                | index file name    |
| --tsconfig <directory + file>                 | tsconfig.json path |
| --bundle                                      | bundle code        |
| --minify                                      | minify code        |
| --map, --sourcemap                            | generate sourcemap |

`package.json` example:

```json
{
	"scripts": {
		"build": "stormode build",
		"build2": "stormode build --config anyname.ts",
		"build3": "stormode build --minify --map",
		"build4": "stormode build -e test --rootDir app --outDir build"
	}
}
```

## production preview

Preview your production-ready server with this command.

```bash
stormode preview
```

| param                                         | description        |
| --------------------------------------------- | ------------------ |
| -c, --config <directory + file>               | config file path   |
| -withtime, --withTime, --withTime <utc/local> | terminal with time |
| --outdir, --outDir <directory>                | output directory   |
| --index <file>                                | index file name    |

`package.json` example:

```json
{
	"scripts": {
		"preview": "stormode preview",
		"preview2": "stormode preview --config anyname.ts",
		"preview3": "stormode preview --index main.ts"
	}
}
```
