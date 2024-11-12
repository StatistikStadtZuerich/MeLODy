"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sumNumericValues = exports.groupDataByQueryParamsWithValues = exports.groupDataByQueryParams = exports.bodyToSimpleSelectionCriteria = exports.queryToSimpleSelectionCriteria = exports.bodyToSelectionCriteria = exports.queryToSelectionCriteria = exports.sortKeysBySumOfArrays = exports.sortResultEntriesByValues = exports.countOccurrencesPerGroupPerYear = exports.countOccurrencesPerGroupMultipleKeys = exports.populationPerYear = exports.countOccurrencesPerYearMultipleKeys = exports.countOccurrencesPerYear = exports.countOccurrencesForMultipleKeys = exports.countOccurrences = exports.extractYearRange = exports.deduplicateData = exports.sortData = void 0;
const numberUtils_1 = require("./numberUtils");
const sortData = (data, sortBy, sortAsc = true) => {
    if (data.length && sortBy && sortBy in data[0]) {
        const sortKey = sortBy;
        data.sort((a, b) => {
            const valueA = a[sortKey];
            const valueB = b[sortKey];
            if ((0, numberUtils_1.isNumber)(valueA) && (0, numberUtils_1.isNumber)(valueB)) {
                return compareValues(Number(valueA), Number(valueB), sortAsc);
            }
            return compareValues(valueA, valueB, sortAsc);
        });
    }
};
exports.sortData = sortData;
const compareValues = (valueA, valueB, sortAsc) => {
    if (valueA > valueB)
        return sortAsc ? 1 : -1;
    if (valueA < valueB)
        return sortAsc ? -1 : 1;
    return 0;
};
const deduplicateData = (data) => Array.from(new Set(data));
exports.deduplicateData = deduplicateData;
const extractYearRange = (data) => {
    const dataAsNumbers = (0, exports.deduplicateData)(data
        .map(d => (0, numberUtils_1.numberOrUndefined)(d))
        .filter((num) => num !== undefined))
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
exports.extractYearRange = extractYearRange;
const countOccurrences = (data, key) => {
    const initialCount = {};
    return data.reduce((acc, curr) => {
        const value = curr[key];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, { ...initialCount });
};
exports.countOccurrences = countOccurrences;
const countOccurrencesForMultipleKeys = (data, keys) => {
    const counts = {};
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
exports.countOccurrencesForMultipleKeys = countOccurrencesForMultipleKeys;
const countOccurrencesPerYear = (data, key, yearKey, forYears) => {
    const result = {};
    const yearIndexMap = new Map(forYears.map((year, i) => [year, i]));
    data.forEach(item => {
        const value = item[key];
        if (value !== undefined) {
            const yearValue = (0, numberUtils_1.intOrUndefined)(item[yearKey]);
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
exports.countOccurrencesPerYear = countOccurrencesPerYear;
const countOccurrencesPerYearMultipleKeys = (data, keys, yearKey, forYears) => {
    const result = {};
    const yearIndexMap = {};
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
exports.countOccurrencesPerYearMultipleKeys = countOccurrencesPerYearMultipleKeys;
const populationPerYear = (data, populationKey, dataYearKey, forYears) => {
    const yearIndexMap = new Map(forYears.map((year, i) => [year, i]));
    const populationCounts = new Array(forYears.length).fill(0);
    data.forEach(item => {
        const yearValue = (0, numberUtils_1.intOrUndefined)(item[dataYearKey]);
        const populationValue = (0, numberUtils_1.intOrUndefined)(item[populationKey]);
        if (yearValue !== undefined && populationValue !== undefined) {
            const yearIndex = yearIndexMap.get(yearValue);
            if (yearIndex !== undefined) {
                populationCounts[yearIndex] += populationValue;
            }
        }
    });
    return populationCounts;
};
exports.populationPerYear = populationPerYear;
const countOccurrencesPerGroupMultipleKeys = (data, keys, groupByKey, groupValues) => {
    const result = {};
    const groupIndexMap = {};
    if (groupValues.length === 0) {
        return result;
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
exports.countOccurrencesPerGroupMultipleKeys = countOccurrencesPerGroupMultipleKeys;
const countOccurrencesPerGroupPerYear = (data, keys, groupByKey, groupValues, yearKey) => {
    if (groupValues.length === 0) {
        return {};
    }
    const keysWithoutGroupKey = keys.filter(key => key !== groupByKey);
    const groupIndexMap = Object.fromEntries(groupValues.map((val, idx) => [String(val), idx]));
    const yearsSet = new Set(data.map(item => (0, numberUtils_1.intOrUndefined)(item[yearKey])).filter(year => year !== undefined));
    const yearValues = Array.from(yearsSet).sort((a, b) => a - b);
    const yearIndexMap = Object.fromEntries(yearValues.map((val, idx) => [val, idx]));
    const result = keysWithoutGroupKey.reduce((acc, key) => {
        acc[String(key)] = {};
        return acc;
    }, {});
    data.forEach(item => {
        const groupValue = String(item[groupByKey] ?? '');
        const groupIndex = groupIndexMap[groupValue];
        const yearValue = (0, numberUtils_1.intOrUndefined)(item[yearKey]);
        if (yearValue !== undefined && groupIndex !== undefined) {
            const yearIndex = yearIndexMap[yearValue];
            keysWithoutGroupKey.forEach(key => {
                const value = String(item[key] ?? '');
                if (!result[String(key)][value]) {
                    result[String(key)][value] = Array.from({ length: yearValues.length }, () => Array(groupValues.length).fill(0));
                }
                result[String(key)][value][yearIndex][groupIndex]++;
            });
        }
    });
    return result;
};
exports.countOccurrencesPerGroupPerYear = countOccurrencesPerGroupPerYear;
const sortResultEntriesByValues = (result, sortAsc = false) => {
    const sortedResult = {};
    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            const entries = Object.entries(result[key]);
            entries.sort(([, valueA], [, valueB]) => compareValues(valueA, valueB, sortAsc));
            sortedResult[key] = Object.fromEntries(entries);
        }
    }
    return sortedResult;
};
exports.sortResultEntriesByValues = sortResultEntriesByValues;
const sumArrayValues = (arr) => {
    return arr.reduce((acc, curr) => acc + curr, 0);
};
const sortKeysBySumOfArrays = (result, sortAsc = false) => {
    const sortedResult = {};
    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            const entries = Object.entries(result[key]);
            entries.sort(([, arrayA], [, arrayB]) => compareValues(sumArrayValues(arrayA), sumArrayValues(arrayB), sortAsc));
            sortedResult[key] = Object.fromEntries(entries);
        }
    }
    return sortedResult;
};
exports.sortKeysBySumOfArrays = sortKeysBySumOfArrays;
const createSelectionCriteria = (input) => {
    const { sortBy, sortAsc = false, limit, offset = 0 } = input;
    return {
        sortBy: sortBy,
        sortAsc: sortAsc === undefined ? true : Boolean(sortAsc),
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined
    };
};
const queryToSelectionCriteria = (req) => createSelectionCriteria(req.query);
exports.queryToSelectionCriteria = queryToSelectionCriteria;
const bodyToSelectionCriteria = (body) => createSelectionCriteria(body);
exports.bodyToSelectionCriteria = bodyToSelectionCriteria;
const createSimpleSelectionCriteria = (input) => {
    const { sortAsc = false } = input;
    return {
        sortAsc: sortAsc === undefined ? true : Boolean(sortAsc),
    };
};
const queryToSimpleSelectionCriteria = (req) => createSimpleSelectionCriteria(req.query);
exports.queryToSimpleSelectionCriteria = queryToSimpleSelectionCriteria;
const bodyToSimpleSelectionCriteria = (body) => createSimpleSelectionCriteria(body);
exports.bodyToSimpleSelectionCriteria = bodyToSimpleSelectionCriteria;
const groupDataByQueryParams = (data, subroutes) => {
    const dataKeys = subroutes
        .filter(key => data.some(item => key in item))
        .map(key => key);
    const result = {};
    data.forEach(item => {
        let currentLevel = result;
        for (let i = 0; i < dataKeys.length; i++) {
            const key = dataKeys[i];
            const keyValue = item[key];
            if (keyValue === undefined || keyValue === null) {
                continue;
            }
            if (!currentLevel[keyValue]) {
                currentLevel[keyValue] = i === dataKeys.length - 1 ? 0 : {};
            }
            if (i === dataKeys.length - 1) {
                currentLevel[keyValue] += 1;
            }
            else {
                currentLevel = currentLevel[keyValue];
            }
        }
    });
    return {
        keys: dataKeys,
        total: (0, exports.sumNumericValues)(result),
        result
    };
};
exports.groupDataByQueryParams = groupDataByQueryParams;
const groupDataByQueryParamsWithValues = (data, subroutes) => {
    const dataKeys = subroutes
        .filter((key) => data.some((item) => key in item))
        .map((key) => key);
    const result = {};
    data.forEach((item) => {
        let currentLevel = result;
        for (let i = 0; i < dataKeys.length; i++) {
            const key = dataKeys[i];
            const keyValue = item[key];
            if (keyValue === undefined || keyValue === null) {
                continue;
            }
            if (i < dataKeys.length - 1) {
                // Intermediate levels: use keyValue as key
                if (!currentLevel[keyValue]) {
                    currentLevel[keyValue] = {};
                }
                currentLevel = currentLevel[keyValue];
            }
            else {
                // Deepest level: collect keyValues into an array
                if (!currentLevel.values) {
                    currentLevel.values = [];
                }
                currentLevel.values.push(keyValue);
            }
        }
    });
    return {
        keys: dataKeys,
        total: data.length,
        result,
    };
};
exports.groupDataByQueryParamsWithValues = groupDataByQueryParamsWithValues;
const sumNumericValues = (obj) => {
    const recursiveSum = (input) => {
        if ((0, numberUtils_1.isNumber)(input)) {
            return input;
        }
        else if (input && typeof input === 'object') {
            return Object.values(input).reduce((acc, value) => acc + recursiveSum(value), 0);
        }
        return 0;
    };
    return recursiveSum(obj);
};
exports.sumNumericValues = sumNumericValues;
