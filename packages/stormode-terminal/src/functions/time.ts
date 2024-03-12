type GetTimeOptions = {
    type: "utc" | "local";
};

const addZero = (val: number, add: number): string => {
    return val.toString().padStart(add, "0");
};

const getTime = (options: GetTimeOptions): string => {
    const now: Date =
        options.type === "utc"
            ? new Date(Date.now() + new Date().getTimezoneOffset() * 60000)
            : new Date();
    const year: number = now.getFullYear();
    const month: number = now.getMonth() + 1;
    const day: number = now.getDate();
    const hours: number = now.getHours();
    const minutes: number = now.getMinutes();
    const seconds: number = now.getSeconds();
    const milliseconds: number = now.getMilliseconds();

    return (
        year +
        "/" +
        addZero(month, 2) +
        "/" +
        addZero(day, 2) +
        " " +
        addZero(hours, 2) +
        ":" +
        addZero(minutes, 2) +
        ":" +
        addZero(seconds, 2) +
        ":" +
        addZero(milliseconds, 3)
    );
};

export type { GetTimeOptions };
export { getTime };
