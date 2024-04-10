import * as path from "node:path";

import * as fse from "fs-extra";
import terminal from "stormode-terminal";

type ExistsAndRename = {
    root: string;
    name: string;
};

const existsAndRename = async (options: ExistsAndRename): Promise<string> => {
    const o: ExistsAndRename = options;
    let count: number = 1;
    let projectRoot: string = path.join(o.root, o.name);

    while (await fse.exists(projectRoot)) {
        count++;

        let oldName: string = o.name;
        if (count > 2) oldName += `-${count - 1}`;

        const newName: string = `${o.name}-${count}`;

        const msg: string = `Folder (${oldName}) already exists`;
        const msg2: string = `project renamed to (${newName})`;

        projectRoot = path.join(o.root, `${newName}`);
        terminal.info(`${msg}, ${msg2}`);
    }

    return projectRoot;
};

export { existsAndRename };
