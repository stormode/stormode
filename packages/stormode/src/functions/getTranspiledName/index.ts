const getTranspiledName = (pathOrFile: string): string => {
    const val: string = pathOrFile;
    const lastDot: number = val.lastIndexOf(".");
    const lastSlash: number = val.lastIndexOf("/");

    const name: string = val.substring(lastSlash + 1, lastDot);
    const ext: string = val.substring(lastDot + 1);

    switch (ext) {
        case "ts":
        case "js":
            return name + ".js";
        case "mts":
        case "mjs":
            return name + ".mjs";
        case "cts":
        case "cjs":
            return name + ".cjs";
        default:
            return name + ".js";
    }
};

export { getTranspiledName };
