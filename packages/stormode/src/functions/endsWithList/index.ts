const endsWithList = (val: string, list: string[]): boolean => {
    return list.some((item: string): boolean => val.endsWith(item));
};

export { endsWithList };
