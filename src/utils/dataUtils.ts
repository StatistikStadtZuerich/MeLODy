import {intOrUndefined, isNumber, numberOrUndefined} from "./numberUtils";
import {YearRange} from "../models/yearRange";
import {SelectionCriteria, SimpleSelectionCriteria} from "../models/SelectionCriteria";
import {Request} from 'express';
import {ResultType, ResultTypeWithArrays, ResultTypeWithMatrix} from "../models/response/results";


export const sortData = <T extends object>(data: T[], sortBy: string | undefined, sortAsc: boolean = true) => {
    if (data.length && sortBy && sortBy in data[0]) {
        const sortKey = sortBy as keyof T;
        data.sort((a, b) => {
                const valueA = a[sortKey];
                const valueB = b[sortKey];
                if (isNumber(valueA) && isNumber(valueB)) {
                    return compareValues(Number(valueA), Number(valueB), sortAsc);
                }
                return compareValues(valueA, valueB, sortAsc);
            }
        );
    }
}

const compareValues = <T>(valueA: T, valueB: T, sortAsc: boolean): number => {
    if (valueA > valueB) return sortAsc ? 1 : -1;
    if (valueA < valueB) return sortAsc ? -1 : 1;
    return 0;
};

export const deduplicateData = <T>(data: T[]): T[] => Array.from(new Set(data));

export const extractYearRange = (data: (string | number)[]): YearRange | undefined => {
    const dataAsNumbers: number[] = deduplicateData(data
        .map(d => numberOrUndefined(d))
        .filter((num): num is number => num !== undefined)
    )
        .sort((a, b) => a - b);

    if (dataAsNumbers.length) {
        const startYear = dataAsNumbers[0];
        const endYear = dataAsNumbers[dataAsNumbers.length - 1];
        const yearsIncluded = dataAsNumbers;

        return {
            startYear,
            endYear,
            yearsIncluded
        };
    }
};

export const countOccurrences = <T extends object>(data: T[], key: keyof T): Record<string, number> => {
    const initialCount: Record<string, number> = {};
    return data.reduce((acc, curr) => {
        const value = curr[key] as string;
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {...initialCount});
};

export const countOccurrencesForMultipleKeys = <T extends object>(
    data: T[],
    keys: (keyof T)[]
): ResultType => {
    const counts: ResultType = {};

    for (const key of keys) {
        counts[String(key)] = {};
    }

    for (const item of data) {
        for (const key of keys) {
            const value = item[key];
            if (value !== undefined && value !== null) {
                const keyStr = String(key);
                const valueStr = String(value);
                counts[keyStr][valueStr] = (counts[keyStr][valueStr] || 0) + 1;
            }
        }
    }

    return counts;
};

export const countOccurrencesPerYear = <T extends object>(
    data: T[],
    key: keyof T,
    yearKey: keyof T,
    forYears: number[]
): Record<string, number[]> => {
    const result: Record<string, number[]> = {};
    const yearIndexMap = new Map(forYears.map((year, i) => [year, i]));

    data.forEach(item => {
        const value = item[key] as string;
        if (value !== undefined) {
            const yearValue = intOrUndefined(item[yearKey]);
            if (yearValue !== undefined) {
                const yearIndex = yearIndexMap.get(yearValue);
                if (yearIndex !== undefined) {
                    result[value] ??= new Array(forYears.length).fill(0);
                    result[value][yearIndex]++;
                }
            }
        }
    });
    return result;
};


export const countOccurrencesPerYearMultipleKeys = <T extends Record<string, any>>(
    data: T[],
    keys: (keyof T)[],
    yearKey: keyof T,
    forYears: number[]
): ResultTypeWithArrays => {
    const result: ResultTypeWithArrays = {};
    const yearIndexMap: Record<number, number> = {};

    forYears.forEach((year, index) => {
        yearIndexMap[year] = index;
    });

    keys.forEach(key => {
        result[String(key)] = {};
    });

    data.forEach(item => {
        const yearValue = item[yearKey];
        if (yearValue !== undefined) {
            const yearIndex = yearIndexMap[Number(yearValue)];
            if (yearIndex !== undefined) {
                keys.forEach(key => {
                    const value = item[key];
                    if (value !== undefined) {
                        const keyStr = String(key);
                        const valueStr = String(value);
                        result[keyStr][valueStr] = result[keyStr][valueStr] || new Array(forYears.length).fill(0);
                        result[keyStr][valueStr][yearIndex]++;
                    }
                });
            }
        }
    });

    return result;
};

export const populationPerYear = <T extends object>(data: T[], populationKey: keyof T, dataYearKey: keyof T, forYears: number[]): number[] => {
    const yearIndexMap = new Map(forYears.map((year, i) => [year, i]));
    const populationCounts = new Array(forYears.length).fill(0);

    data.forEach(item => {
        const yearValue = intOrUndefined(item[dataYearKey]);
        const populationValue = intOrUndefined(item[populationKey]);
        if (yearValue !== undefined && populationValue !== undefined) {
            const yearIndex = yearIndexMap.get(yearValue);
            if (yearIndex !== undefined) {
                populationCounts[yearIndex] += populationValue;
            }
        }
    });

    return populationCounts;
};

export const countOccurrencesPerGroupMultipleKeys = <T extends Record<string, any>, G>(
    data: T[],
    keys: (keyof T)[],
    groupByKey: keyof T,
    groupValues: G[]
): ResultTypeWithArrays => {
    const result: ResultTypeWithArrays = {};
    const groupIndexMap: Record<string, number> = {};

    if (groupValues.length === 0) {
        return result
    }

    groupValues.forEach((groupValue, index) => {
        groupIndexMap[String(groupValue)] = index;
    });

    const keysWithoutGroupKey = keys.filter(key => key !== groupByKey);

    keysWithoutGroupKey.forEach(key => {
        result[String(key)] = {};
    });

    data.forEach(item => {
        const groupValue = item[groupByKey];
        const groupStr = String(groupValue);
        const groupIndex = groupIndexMap[groupStr];

        if (groupIndex !== undefined) {
            keysWithoutGroupKey.forEach(key => {
                const value = item[key];
                if (value !== null) {
                    const keyStr = String(key);
                    const valueStr = String(value);
                    result[keyStr][valueStr] = result[keyStr][valueStr] ?? new Array(groupValues.length).fill(0);
                    result[keyStr][valueStr][groupIndex]++;
                }
            });
        }
    });

    return result;
};


export const countOccurrencesPerGroupPerYear = <T extends Record<string, any>, G>(
    data: T[],
    keys: (keyof T)[],
    groupByKey: keyof T,
    groupValues: G[],
    yearKey: keyof T
): ResultTypeWithMatrix => {
    if (groupValues.length === 0) {
        return {};
    }

    const keysWithoutGroupKey = keys.filter(key => key !== groupByKey);

    const groupIndexMap = Object.fromEntries(groupValues.map((val, idx) => [String(val), idx]));
    const yearsSet = new Set(data.map(item => intOrUndefined(item[yearKey])).filter(year => year !== undefined));
    const yearValues = Array.from(yearsSet).sort((a, b) => a - b);
    const yearIndexMap = Object.fromEntries(yearValues.map((val, idx) => [val, idx]));

    const result: ResultTypeWithMatrix = keysWithoutGroupKey.reduce((acc, key) => {
        acc[String(key)] = {};
        return acc;
    }, {} as ResultTypeWithMatrix);

    data.forEach(item => {
        const groupValue = String(item[groupByKey] ?? '');
        const groupIndex = groupIndexMap[groupValue];
        const yearValue = intOrUndefined(item[yearKey]);

        if (yearValue !== undefined && groupIndex !== undefined) {
            const yearIndex = yearIndexMap[yearValue];

            keysWithoutGroupKey.forEach(key => {
                const value = String(item[key] ?? '');
                if (!result[String(key)][value]) {
                    result[String(key)][value] = Array.from({length: yearValues.length}, () => Array(groupValues.length).fill(0));
                }
                result[String(key)][value][yearIndex][groupIndex]++;
            });
        }
    });

    return result;
};


export const sortResultEntriesByValues = (result: ResultType, sortAsc: boolean = false): ResultType => {
    const sortedResult: ResultType = {};

    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            const entries = Object.entries(result[key]);
            entries.sort(([, valueA], [, valueB]) => compareValues(valueA, valueB, sortAsc));
            sortedResult[key] = Object.fromEntries(entries);
        }
    }

    return sortedResult;
};


const sumArrayValues = (arr: number[]): number => {
    return arr.reduce((acc, curr) => acc + curr, 0);
};

export const sortKeysBySumOfArrays = (result: ResultTypeWithArrays, sortAsc: boolean = false): ResultTypeWithArrays => {
    const sortedResult: ResultTypeWithArrays = {};
    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            const entries = Object.entries(result[key]);
            entries.sort(([, arrayA], [, arrayB]) => compareValues(sumArrayValues(arrayA), sumArrayValues(arrayB), sortAsc));
            sortedResult[key] = Object.fromEntries(entries);
        }
    }
    return sortedResult
};

const createSelectionCriteria = <T>(input: any): SelectionCriteria<T> => {
    const {sortBy, sortAsc = false, limit, offset = 0} = input;
    return {
        sortBy: sortBy as keyof T,
        sortAsc: sortAsc === undefined ? true : Boolean(sortAsc),
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined
    };
};

export const queryToSelectionCriteria = <T>(req: Request): SelectionCriteria<T> => createSelectionCriteria<T>(req.query);

export const bodyToSelectionCriteria = <T>(body: Partial<SelectionCriteria<T>>): SelectionCriteria<T> => createSelectionCriteria<T>(body);


const createSimpleSelectionCriteria = (input: any): SimpleSelectionCriteria => {
    const {sortAsc = false} = input;
    return {
        sortAsc: sortAsc === undefined ? true : Boolean(sortAsc),
    };
};

export const queryToSimpleSelectionCriteria = <T>(req: Request): SimpleSelectionCriteria => createSimpleSelectionCriteria(req.query);

export const bodyToSimpleSelectionCriteria = <T>(body: Partial<SimpleSelectionCriteria>): SimpleSelectionCriteria => createSimpleSelectionCriteria(body);

export const groupDataByQueryParamsCombined = <T extends Record<string, any>>(
    data: T[],
    subroutes: string[],
    sumArrays: boolean = true
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

    const cleanResult = transformResultCombined(result, sumArrays);

    return {
        keys: dataKeys as string[],
        total: sumNumericValues(cleanResult),
        result: cleanResult,
    };
};

function transformResultCombined(obj: any, sumArrays: boolean = true): any {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (obj._values) {
        const valuesArray = Array.from(obj._values);
        if (valuesArray.length === 1) {
            return valuesArray[0];
        } else {
            if (sumArrays) {
                return (valuesArray as number[]).reduce((acc, val) => acc + val, 0);
            } else {
                return valuesArray;
            }
        }
    }

    const keys = Object.keys(obj).filter((key) => key !== '_values');

    for (const key of keys) {
        obj[key] = transformResultCombined(obj[key], sumArrays);
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
