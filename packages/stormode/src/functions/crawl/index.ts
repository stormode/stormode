import { fdir } from "fdir";

type CrawlOptions = {
    path: string;
    full: boolean;
    dir?: boolean;
};

const crawl = async (options: CrawlOptions): Promise<string[]> => {
    let result: fdir = new fdir();

    if (options.full) {
        result = result.withFullPaths();
    } else {
        result = result.withRelativePaths();
    }

    if (options.dir) {
        result = result.withDirs();
    }

    return await result.crawl(options.path).withPromise();
};

export { crawl };
