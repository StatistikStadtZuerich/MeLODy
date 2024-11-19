import {isNumber, numberOrUndefined} from "./numberUtils";
import {defaultTransformationOptions, TransformationOptions} from "../models/transformationOptions";
import {createStatisticalSummaries} from "./statisticalDataUtils";

export const groupDataByQueryParamsCombined = <T extends Record<string, any>>(
    data: T[],
    subroutes: string[],
    options: TransformationOptions = defaultTransformationOptions
): {
    keys: string[];
    result: any;
    total: number;
} => {
    const dataKeys = subroutes
        .filter((key) => data.some((item) => key in item))
        .map((key) => key as keyof T);

    const result: any = {};

    data.forEach((item) => {
        let currentLevel = result;

        for (let i = 0; i < dataKeys.length; i++) {
            const key = dataKeys[i];
            const keyValue = item[key];

            if (keyValue === undefined || keyValue === null) {
                continue;
            }

            if (i < dataKeys.length - 1) {
                if (!currentLevel[keyValue]) {
                    currentLevel[keyValue] = {};
                }
                currentLevel = currentLevel[keyValue];
            } else {
                if (isNumber(keyValue)) {
                    if (!currentLevel._values) {
                        currentLevel._values = [];
                    }
                    currentLevel._values.push(numberOrUndefined(keyValue)!);
                } else {
                    if (!currentLevel[keyValue]) {
                        currentLevel[keyValue] = 0;
                    }
                    currentLevel[keyValue] += 1;
                }
            }
        }
    });

    const cleanResult = transformResultCombined(result, options);

    return {
        keys: dataKeys as string[],
        total: sumNumericValues(cleanResult),
        result: cleanResult,
    };
};

function transformResultCombined(obj: any, options: TransformationOptions = defaultTransformationOptions): any {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (obj._values) {
        const valuesArray = Array.from(obj._values);
        if (valuesArray.length === 1) {
            return valuesArray[0];
        } else {
            if (options.sum) {
                return (valuesArray as number[]).reduce((acc, val) => acc + val, 0);
            } else if (options.statisticalSummaries) {
                return createStatisticalSummaries(valuesArray as number[])
            } else {
                return valuesArray;
            }
        }
    }

    const keys = Object.keys(obj).filter((key) => key !== '_values');

    for (const key of keys) {
        obj[key] = transformResultCombined(obj[key], options);
    }

    return obj;
}


function sumNumericValues(obj: any): number {
    if (typeof obj === 'number') {
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.length;
    } else if (typeof obj === 'object') {
        let sum = 0;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sum += sumNumericValues(obj[key]);
            }
        }
        return sum;
    } else {
        return 0;
    }
}

export const mapItemsAsKeys = <T>(items: string[], keyMap: Record<string, keyof T>): (keyof T)[] => items.map((item) => keyMap[item] || item as keyof T).filter(Boolean)