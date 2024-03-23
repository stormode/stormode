import npmFetch from "npm-registry-fetch";

type PkgInfo = {
    "dist-tags": {
        latest: string;
        [tag: string]: string;
    };
};

const latest = async (name: string): Promise<string> => {
    try {
        const registryUrl: string = "https://registry.npmjs.org/";
        const packageUrl: string = `${registryUrl}${name}`;

        const response: PkgInfo = (await npmFetch.json(packageUrl)) as PkgInfo;
        const latestVersion: string = response["dist-tags"].latest;
        return `^${latestVersion}`;
    } catch (e: unknown) {
        const ermsg: string = `Failed to get the latest version of ${name}`;
        throw new Error(ermsg);
    }
};

export { latest };
