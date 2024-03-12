import type { Logs } from "stormode-terminal";

import tml from "stormode-terminal";

import { terminalTime } from "#/configs/env";

const terminal: Logs = tml.withConfig({
    time: terminalTime(),
});

export { terminal };
