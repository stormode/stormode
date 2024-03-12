type ColorFunction = (val: string) => string;

type Color = {
    redLight: ColorFunction;
    red: ColorFunction;
    redDark: ColorFunction;

    yellowLight: ColorFunction;
    yellow: ColorFunction;
    yellowDark: ColorFunction;

    blueLight: ColorFunction;
    blue: ColorFunction;
    blueDark: ColorFunction;

    greenLight: ColorFunction;
    green: ColorFunction;
    greenDark: ColorFunction;

    purpleLight: ColorFunction;
    purple: ColorFunction;
    purpleDark: ColorFunction;
};

export type { Color, ColorFunction };
