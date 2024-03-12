import prompts from "prompts";

type Variant = {
    title: string;
    value: string;
    color: (val: string) => string;
};

type Framework = {
    title: string;
    value: string;
    color: ((val: string) => string) | null;
    variants?: Variant[];
};

type FwChoice = {
    title: string;
    value: Framework;
};

type VrChoice = {
    title: string;
    value: string;
};

type Answers = prompts.Answers<"name" | "framework" | "variant">;

export type { Variant, Framework, FwChoice, VrChoice, Answers };
