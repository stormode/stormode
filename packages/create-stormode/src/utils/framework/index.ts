import type { Framework, FwChoice, Variant, VrChoice } from "#/@types/question";

import { color } from "stormode-terminal";

const frameworks: Framework[] = [
    {
        title: "Vanilla",
        value: "vanilla",
        color: color.green,
        variants: [
            {
                title: "Vanilla + TypeScript",
                value: "ts",
                color: color.blue,
            },
            {
                title: "Vanilla + JavaScript",
                value: "js",
                color: color.yellow,
            },
        ],
    },
    {
        title: "Express",
        value: "express",
        color: color.yellow,
        variants: [
            {
                title: "Express + TypeScript",
                value: "ts",
                color: color.blue,
            },
            {
                title: "Express + JavaScript",
                value: "js",
                color: color.yellow,
            },
        ],
    },
    {
        title: "Koa",
        value: "koa",
        color: color.purple,
        variants: [
            {
                title: "Koa + TypeScript",
                value: "ts",
                color: color.blue,
            },
            {
                title: "Koa + JavaScript",
                value: "js",
                color: color.yellow,
            },
        ],
    },
    {
        title: "Fastify",
        value: "fastify",
        color: null,
        variants: [
            {
                title: "Fastify + TypeScript",
                value: "ts",
                color: color.blue,
            },
            {
                title: "Fastify + JavaScript",
                value: "js",
                color: color.yellow,
            },
        ],
    },
];

const getFramework = (): FwChoice[] => {
    return frameworks.map(
        (fw: Framework): FwChoice => ({
            title: fw.color ? fw.color(fw.title) : fw.title,
            value: fw,
        }),
    );
};

const getFrameworkVariant = (fw: Framework): VrChoice[] => {
    const choices: VrChoice[] = [];
    fw.variants?.map((variant: Variant): void => {
        choices.push({
            title: variant.color(variant.title),
            value: variant.value,
        });
    });
    return choices;
};

export { getFramework, getFrameworkVariant };
