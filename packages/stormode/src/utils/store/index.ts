const store: Map<string, string> = new Map();

const set = async (key: string, value: string): Promise<void> => {
    await new Promise((resolve): void => {
        resolve(store.set(key, value));
    });
};

const has = async (key: string): Promise<boolean> => {
    return await new Promise((resolve): void => {
        resolve(store.has(key));
    });
};

const get = async (key: string): Promise<string | undefined> => {
    return await new Promise((resolve): void => {
        resolve(store.get(key));
    });
};

export { set, has, get };
