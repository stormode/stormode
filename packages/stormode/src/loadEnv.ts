import { setProcessEnv } from "#/utils/env";

if (process.env.NODE_ENV === "production") {
    setProcessEnv();
}
