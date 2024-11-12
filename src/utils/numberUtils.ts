export const numberOrUndefined = (num: unknown): number | undefined => {
    if (typeof num === 'number') {
        return num;
    } else if (!isNaN(Number(num))) {
        return Number(num);
    }
    return undefined;
}

export const intOrUndefined = (num: unknown): number | undefined => {
    if (typeof num === 'number' || !isNaN(Number(num))) {
        return parseInt(String(num), 10);
    }
    return undefined;
}


export const isNumber = (value: unknown): boolean => typeof value === 'number' || !isNaN(Number(value))