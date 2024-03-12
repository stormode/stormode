import { envLoader } from "#/utils/env/loader";

if (process.env.NODE_ENV === "production") {
    envLoader();
}
