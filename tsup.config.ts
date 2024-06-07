import * as path from "node:path";
import { defineConfig } from "tsup";

const pkg: string = path.resolve(process.cwd(), "packages", "create-stormode");

export default defineConfig([
    {
        minify: true,
        platform: "node",
        tsconfig: path.join(pkg, "tsconfig.json"),
        entry: {
            index: path.join(pkg, "src", "index.ts"),
        },
        outDir: path.join(pkg, "dist"),
    },
]);
