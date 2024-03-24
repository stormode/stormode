## 0.5.0 (Coming Soon)

### What's New

-   Add config: `swc`, `build.esbuild`
-   Add `swc` for transpilation
-   Add `dotenv-expand` for env variable expansion

### What's Changed

-   Deprecate config: `build.platform`
-   No longer using `tsc` for transpilation
-   Better support on ES Module
-   Better support on monorepo
-   Fix the parsing issue in json file
-   Update progress behaviour on exit and error
-   Rework on env utility

### Migrate from v0.4.x

to keep type checking your TypeScript code, add `tsc` command before `stormode build`:

```bash
tsc && stormode build
```

and add `noEmit` to `tsconfig.json` to prevent `tsc` generate any file:

```json
{
    "compilerOptions": {
        "noEmit": true
    }
}
```

## 0.4.1 (2024-03-19)

### What's Changed

-   Fix for using Stormode in JavaScript

## 0.4.0 (2024-03-18)

### What's New

-   Add bundle mode
-   Add new config: `withTime`, `build.platform`, `build.bundle`

### What's Changed

-   Better terminal message
-   Better source map support
-   Better monorepo support
-   Deprecate config: `sourcemap`, `build.tsconfig`

## 0.3.1 (2023-08-23)

### What's Changed

-   Fix the issue that the process cannot access the files by adding retry.

## 0.3.0 (2023-08-23)

### What's New

-   Add more parameters for the commands

### What's Changed

-   Structure rework
-   Fix for missing env loading
-   Config file changes
-   Remove `nodemon`, `@types/nodemon`
-   Remove `tsconfig-paths`
-   No longer require `ts-node` to be installed

## 0.2.1 (2023-08-13)

### What's Changed

-   Increase the compatibilities between JavaScript, TypeScript, CommonJS and ESModule in Stormode config file.

## 0.2.0 (2023-08-12)

### What's New

-   Add new dependency: `stormode-terminal`

### What's Changed

-   Update `README.md` for the config file in TypeScript
-   Simplify the path to access `Config` types.

## 0.1.0 (2023-08-07)

First release
