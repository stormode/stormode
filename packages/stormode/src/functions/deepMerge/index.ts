const deepMerge = async <
    // biome-ignore lint: string, number, boolean, object
    Source extends Record<string, any>,
    // biome-ignore lint: string, number, boolean, object
    Extend extends Record<string, any>,
>(
    source: Source | null | undefined,
    extend: Extend | null | undefined,
): Promise<Source & Extend> => {
    if (!source) return extend as Source & Extend;
    if (!extend) return source as Source & Extend;

    const merged: Partial<Source & Extend> = {};

    // check source
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            // deep merge
            if (
                typeof source[key] === "object" &&
                typeof extend[key] === "object"
            ) {
                merged[key] = await deepMerge(source[key], extend[key]);
            }
            // override
            else {
                merged[key] =
                    extend[key] !== undefined ? extend[key] : source[key];
            }
        }
    }

    // check extend to add new
    for (const key in extend) {
        if (
            Object.prototype.hasOwnProperty.call(extend, key) &&
            !Object.prototype.hasOwnProperty.call(source, key)
        ) {
            merged[key] = extend[key];
        }
    }

    return merged as Source & Extend;
};

export { deepMerge };
