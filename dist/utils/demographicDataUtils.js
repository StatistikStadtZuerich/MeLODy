"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateDemographicData = exports.reqToDemographicData = exports.bodyToDemographicDataRequest = exports.mapQueryToDemographicDataRequest = exports.demographicKeyMap = exports.demographicDataFiltered = void 0;
const numberUtils_1 = require("./numberUtils");
const dataUtils_1 = require("./dataUtils");
const stringUtils_1 = require("./stringUtils");
const demographicDataFiltered = (req, data) => {
    let filteredData = data;
    const { startYear, endYear, year, kreis, quar, age, minAge, maxAge, sex, herkunft } = req;
    if (Object.values(req).every(value => value === undefined)) {
        return filteredData;
    }
    const startYearInt = (0, numberUtils_1.intOrUndefined)(startYear);
    const endYearInt = (0, numberUtils_1.intOrUndefined)(endYear);
    const yearInt = (0, numberUtils_1.intOrUndefined)(year);
    return filteredData.filter(d => {
        if (startYearInt !== undefined && ((0, numberUtils_1.intOrUndefined)(d.StichtagDatJahr) || 0) < startYearInt) {
            return false;
        }
        if (endYearInt !== undefined && ((0, numberUtils_1.intOrUndefined)(d.StichtagDatJahr) || Number.MAX_SAFE_INTEGER) > endYearInt) {
            return false;
        }
        if (yearInt !== undefined && ((0, numberUtils_1.intOrUndefined)(d.StichtagDatJahr) || 0) !== yearInt) {
            return false;
        }
        if ((0, numberUtils_1.isNumber)(kreis) && (0, numberUtils_1.isNumber)(d.KreisCd)) {
            const kreisInt = (0, numberUtils_1.intOrUndefined)(d.KreisCd);
            const districtInt = (0, numberUtils_1.intOrUndefined)(kreis);
            if (!(kreisInt === districtInt)) {
                return false;
            }
        }
        if (quar && !(d.QuarLang.toLowerCase().includes(quar.toString().toLowerCase()) || d.QuarCd === quar)) {
            return false;
        }
        if ((0, numberUtils_1.isNumber)(d.AlterVCd) && (age || minAge || maxAge)) {
            const ageInt = (0, numberUtils_1.intOrUndefined)(d.AlterVCd);
            if (age && ageInt !== age) {
                return false;
            }
            else if (minAge && maxAge && ageInt < minAge || ageInt > maxAge) {
                return false;
            }
            else if (minAge && !maxAge && ageInt < minAge) {
                return false;
            }
            else if (maxAge && !minAge && ageInt > maxAge) {
                return false;
            }
        }
        if (sex && !(d.SexKurz.toLowerCase() === sex.toString().toLowerCase())) {
            return false;
        }
        if (herkunft && !(d.HerkunftLang.toLowerCase().includes(origin.toString().toLowerCase()) || d.HerkunftCd === origin)) {
            return false;
        }
        return true;
    });
};
exports.demographicDataFiltered = demographicDataFiltered;
const sexString = (sex) => {
    if (typeof sex === 'string') {
        const lowerCaseSex = sex.toLowerCase();
        if (lowerCaseSex === 'm' || lowerCaseSex === 'männlich') {
            return 'M';
        }
        if (lowerCaseSex === 'f' || lowerCaseSex === 'weiblich') {
            return 'F';
        }
    }
};
const herkunftsString = (herkunft) => {
    if (typeof herkunft === 'string') {
        const lowerCaseHerkunft = herkunft.toLowerCase();
        if (lowerCaseHerkunft === 'schweizerin' || lowerCaseHerkunft === 'schweizer*in') {
            return 'Schweizer*in';
        }
        if (lowerCaseHerkunft === 'ausländerin' || lowerCaseHerkunft === 'ausländer*in') {
            return 'Ausländer*in';
        }
    }
};
exports.demographicKeyMap = {
    sex: "SexKurz",
    origin: "HerkunftLang",
    year: "StichtagDatJahr",
    kreis: "KreisLang",
    quar: "QuarLang",
    age: "AlterVCd",
    age5: 'AlterV05Cd',
    age10: 'AlterV10Cd',
    age20: 'AlterV20Cd'
};
const mapQueryToDemographicDataRequest = (req) => {
    const { startYear, endYear, year, kreis, quar, age, minAge, maxAge, sex, herkunft, groupBy = [] } = req.query;
    return {
        startYear: (0, numberUtils_1.intOrUndefined)(startYear),
        endYear: (0, numberUtils_1.intOrUndefined)(endYear),
        year: (0, numberUtils_1.intOrUndefined)(year),
        kreis: (0, numberUtils_1.intOrUndefined)(kreis),
        quar: (0, stringUtils_1.toValidString)(quar),
        age: (0, numberUtils_1.intOrUndefined)(age),
        minAge: (0, numberUtils_1.intOrUndefined)(minAge),
        maxAge: (0, numberUtils_1.intOrUndefined)(maxAge),
        sex: sexString(sex),
        herkunft: herkunftsString(herkunft),
        groupBy: groupBy.map(item => exports.demographicKeyMap[item]).filter(Boolean)
        // responseKeys: responseKeys ? (responseKeys as string[]).map(key => key.toString()) : [],
        // groupBy: groupBy?.toString()?.trim() as keyof DemographicData | undefined
    };
};
exports.mapQueryToDemographicDataRequest = mapQueryToDemographicDataRequest;
const bodyToDemographicDataRequest = (req) => {
    const { startYear, endYear, year, kreis, quar, age, minAge, maxAge, sex, herkunft, groupBy = [] } = req.body || {};
    return {
        startYear: (0, numberUtils_1.intOrUndefined)(startYear),
        endYear: (0, numberUtils_1.intOrUndefined)(endYear),
        year: (0, numberUtils_1.intOrUndefined)(year),
        kreis: (0, numberUtils_1.intOrUndefined)(kreis),
        quar,
        age: (0, numberUtils_1.intOrUndefined)(age),
        minAge: (0, numberUtils_1.intOrUndefined)(minAge),
        maxAge: (0, numberUtils_1.intOrUndefined)(maxAge),
        sex: sexString(sex),
        herkunft: herkunftsString(herkunft),
        groupBy: groupBy.map(item => exports.demographicKeyMap[item]).filter(Boolean)
        // responseKeys: responseKeys ? (responseKeys as string[]).map(key => key.toString()) : [],
        // groupBy: groupBy?.toString()?.trim() as keyof DemographicData | undefined
    };
};
exports.bodyToDemographicDataRequest = bodyToDemographicDataRequest;
const reqToDemographicData = async (req, res, data, perYear) => {
    try {
        const requestBody = (0, exports.bodyToDemographicDataRequest)(req.body);
        const selection = (0, dataUtils_1.bodyToSimpleSelectionCriteria)(req.body);
        const result = await (0, exports.aggregateDemographicData)(requestBody, selection, data, perYear);
        if (!result) {
            res.status(404).json({ message: 'No data found for the specified parameters' });
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
exports.reqToDemographicData = reqToDemographicData;
const aggregateDemographicData = async (requestBody, selection, data, perYear) => {
    const filteredData = (0, exports.demographicDataFiltered)(requestBody, data);
    const defaultKeys = ["SexKurz", "KreisLang", "QuarLang", "HerkunftLang"];
    const keysToRespondWith = defaultKeys.map(key => key);
    if (!filteredData.length) {
        return;
    }
    const yearRange = (0, dataUtils_1.extractYearRange)(filteredData.map(d => d.StichtagDatJahr));
    let aggregatedResult;
    if (perYear) {
        let occurrencePerYear;
        let groupedByValues = [];
        // if (requestBody.groupBy && requestBody.groupBy in filteredData[0]) {
        //     groupedByValues = Array.from(new Set(filteredData.map(item => item[requestBody.groupBy as keyof DemographicData])))
        //     occurrencePerYear = countOccurrencesPerGroupPerYear(filteredData, keysToRespondWith, requestBody.groupBy, groupedByValues, 'StichtagDatJahr')
        // } else {
        // }
        occurrencePerYear = (0, dataUtils_1.sortKeysBySumOfArrays)((0, dataUtils_1.countOccurrencesPerYearMultipleKeys)(filteredData, keysToRespondWith, 'StichtagDatJahr', yearRange?.yearsIncluded || []), selection.sortAsc);
        const populationInYears = (0, dataUtils_1.populationPerYear)(filteredData, 'AnzBestWir', 'StichtagDatJahr', yearRange?.yearsIncluded || []);
        aggregatedResult = {
            returned: filteredData.length,
            yearRange,
            population: populationInYears,
            groupedByValues,
            result: occurrencePerYear
        };
    }
    else {
        let occurrenceCount;
        let groupedByValues = [];
        // if (requestBody.groupBy && requestBody.groupBy in filteredData[0]) {
        //     groupedByValues = Array.from(new Set(filteredData.map(item => item[requestBody.groupBy as keyof DemographicData])))
        //     occurrenceCount = countOccurrencesPerGroupMultipleKeys(filteredData, keysToRespondWith, requestBody.groupBy as keyof DemographicData, groupedByValues);
        // } else {
        // }
        occurrenceCount = (0, dataUtils_1.sortResultEntriesByValues)((0, dataUtils_1.countOccurrencesForMultipleKeys)(filteredData, keysToRespondWith), selection.sortAsc);
        const populationComplete = filteredData.reduce((acc, curr) => acc + ((0, numberUtils_1.intOrUndefined)(curr.AnzBestWir) || 0), 0);
        aggregatedResult = {
            returned: filteredData.length,
            yearRange,
            population: populationComplete,
            groupedByValues,
            result: occurrenceCount
        };
    }
    return aggregatedResult;
};
exports.aggregateDemographicData = aggregateDemographicData;
