import {DemographicData} from "../models/demographicData";
import {intOrUndefined, isNumber} from "./numberUtils";
import {Request, Response} from 'express';

import {DemographicDataRequestQueryFilter} from "../models/request/demographicDataRequest";
import {
    bodyToSimpleSelectionCriteria,
    countOccurrencesForMultipleKeys,
    countOccurrencesPerYearMultipleKeys,
    extractYearRange,
    mapItemsAsKeys,
    populationPerYear,
    sortKeysBySumOfArrays,
    sortResultEntriesByValues
} from "./dataUtils";
import {DemographicDataCountResponse, DemographicDataPerYearResponse} from "../models/response/DemographicDataResponse";
import {ResultType, ResultTypeWithArrays, ResultTypeWithMatrix} from "../models/response/results";
import {SimpleSelectionCriteria} from "../models/SelectionCriteria";
import {toValidString} from "./stringUtils";


export const demographicDataFiltered = (req: DemographicDataRequestQueryFilter, data: DemographicData[]): DemographicData[] => {
    let filteredData = data;
    const {
        startYear,
        endYear,
        year,
        kreis,
        quar,
        age,
        minAge,
        maxAge,
        sex,
        population,
        minPopulation,
        maxPopulation,
        herkunft
    } = req;
    if (Object.values(req).every(value => value === undefined)) {
        return filteredData;
    }
    const startYearInt = intOrUndefined(startYear);
    const endYearInt = intOrUndefined(endYear);

    const yearInt = intOrUndefined(year);

    return filteredData.filter(d => {
        if (startYearInt !== undefined && (intOrUndefined(d.StichtagDatJahr) || 0) < startYearInt) {
            return false;
        }
        if (endYearInt !== undefined && (intOrUndefined(d.StichtagDatJahr) || Number.MAX_SAFE_INTEGER) > endYearInt) {
            return false;
        }
        if (yearInt !== undefined && (intOrUndefined(d.StichtagDatJahr) || 0) !== yearInt) {
            return false;
        }
        if (isNumber(kreis) && isNumber(d.KreisCd)) {
            const kreisInt = intOrUndefined(d.KreisCd)!;
            const districtInt = intOrUndefined(kreis);
            if (!(kreisInt === districtInt)) {
                return false;
            }
        }
        if (quar && !(d.QuarLang.toLowerCase().includes(quar.toString().toLowerCase()) || d.QuarCd === quar)) {
            return false;
        }
        if (isNumber(d.AlterVCd) && (age || minAge || maxAge)) {
            const ageInt = intOrUndefined(d.AlterVCd)!;
            if (age && ageInt !== age) {
                return false;
            } else if (minAge && maxAge && ageInt < minAge || ageInt > maxAge!) {
                return false
            } else if (minAge && !maxAge && ageInt < minAge) {
                return false;
            } else if (maxAge && !minAge && ageInt > maxAge) {
                return false
            }
        }

        if (sex && !(d.SexKurz.toLowerCase() === sex.toString().toLowerCase())) {
            return false;
        }
        if (herkunft && !(d.HerkunftLang.toLowerCase().includes(herkunft.toString().toLowerCase()) || d.HerkunftCd === herkunft)) {
            return false;
        }
        if (isNumber(d.AnzBestWir) && (population || minPopulation || maxPopulation)) {
            const populationInt = intOrUndefined(d.AnzBestWir)!;
            if (population && populationInt !== population) {
                return false;
            } else if (minPopulation && maxPopulation && populationInt < minPopulation || populationInt > maxPopulation!) {
                return false;
            } else if (minPopulation && !maxPopulation && populationInt < minPopulation) {
                return false;
            } else if (maxPopulation && !minPopulation && populationInt > maxPopulation) {
                return false;
            }
        }
        return true;
    });
}

const sexString = (sex: unknown): 'M' | 'F' | undefined => {
    if (typeof sex === 'string') {
        const lowerCaseSex = sex.toLowerCase();
        if (lowerCaseSex === 'm' || lowerCaseSex === 'männlich') {
            return 'M';
        }
        if (lowerCaseSex === 'f' || lowerCaseSex === 'weiblich') {
            return 'F';
        }
    }
}

const herkunftsString = (herkunft: unknown): 'Schweizer*in' | 'Ausländer*in' | undefined => {
    if (typeof herkunft === 'string') {
        const lowerCaseHerkunft = herkunft.toLowerCase();
        if (lowerCaseHerkunft === 'schweizerin' || lowerCaseHerkunft === 'schweizer*in') {
            return 'Schweizer*in';
        }
        if (lowerCaseHerkunft === 'ausländerin' || lowerCaseHerkunft === 'ausländer*in') {
            return 'Ausländer*in';
        }
    }
}

export const demographicKeyMap: Record<string, keyof DemographicData> = {
    sex: "SexKurz",
    herkunft: "HerkunftLang",
    year: "StichtagDatJahr",
    kreis: "KreisLang",
    quar: "QuarLang",
    age: "AlterVCd",
    age5: 'AlterV05Cd',
    age10: 'AlterV10Cd',
    age20: 'AlterV20Cd',
    population: 'AnzBestWir'
}

export const mapQueryToDemographicDataRequest = (req: Request): DemographicDataRequestQueryFilter => {
    const {
        startYear,
        endYear,
        year,
        kreis,
        quar,
        age,
        minAge,
        maxAge,
        sex,
        herkunft,
        population,
        minPopulation,
        maxPopulation,
        groupBy = []
    } = req.query;


    return {
        startYear: intOrUndefined(startYear),
        endYear: intOrUndefined(endYear),
        year: intOrUndefined(year),
        kreis: intOrUndefined(kreis),
        quar: toValidString(quar as string),
        age: intOrUndefined(age),
        minAge: intOrUndefined(minAge),
        maxAge: intOrUndefined(maxAge),
        sex: sexString(sex),
        herkunft: herkunftsString(herkunft),
        population: intOrUndefined(population),
        minPopulation: intOrUndefined(minPopulation),
        maxPopulation: intOrUndefined(maxPopulation),
        groupBy: mapItemsAsKeys(groupBy as string[], demographicKeyMap)
    };
};

export const bodyToDemographicDataRequest = (req: Request): DemographicDataRequestQueryFilter => {
    const {
        startYear,
        endYear,
        year,
        kreis,
        quar,
        age,
        minAge,
        maxAge,
        sex,
        herkunft,
        population,
        minPopulation,
        maxPopulation,
        groupBy = []
    } = req.body || {};

    return {
        startYear: intOrUndefined(startYear),
        endYear: intOrUndefined(endYear),
        year: intOrUndefined(year),
        kreis: intOrUndefined(kreis),
        quar,
        age: intOrUndefined(age),
        minAge: intOrUndefined(minAge),
        maxAge: intOrUndefined(maxAge),
        sex: sexString(sex),
        herkunft: herkunftsString(herkunft),
        population: intOrUndefined(population),
        minPopulation: intOrUndefined(minPopulation),
        maxPopulation: intOrUndefined(maxPopulation),
        groupBy: mapItemsAsKeys(groupBy, demographicKeyMap)
    };
};

export const reqToDemographicData = async (req: Request, res: Response, data: DemographicData[], perYear: boolean) => {

    try {
        const requestBody = bodyToDemographicDataRequest(req.body);
        const selection = bodyToSimpleSelectionCriteria(req.body);
        const result = await aggregateDemographicData(requestBody, selection, data, perYear);
        if (!result) {
            res.status(404).json({message: 'No data found for the specified parameters'});
            return;
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({error});
    }

}

export const aggregateDemographicData = async (requestBody: DemographicDataRequestQueryFilter, selection: SimpleSelectionCriteria, data: DemographicData[], perYear: boolean): Promise<DemographicDataCountResponse | DemographicDataPerYearResponse | undefined> => {
    const filteredData = demographicDataFiltered(requestBody, data);

    const defaultKeys = ["SexKurz", "KreisLang", "QuarLang", "HerkunftLang"];
    const keysToRespondWith = defaultKeys.map(key => key as keyof DemographicData);

    if (!filteredData.length) {
        return;
    }

    const yearRange = extractYearRange(filteredData.map(d => d.StichtagDatJahr));

    let aggregatedResult: DemographicDataCountResponse | DemographicDataPerYearResponse | undefined;

    if (perYear) {
        let occurrencePerYear: ResultTypeWithArrays | ResultTypeWithMatrix;
        let groupedByValues: (string | number)[] = [];
        // if (requestBody.groupBy && requestBody.groupBy in filteredData[0]) {
        //     groupedByValues = Array.from(new Set(filteredData.map(item => item[requestBody.groupBy as keyof DemographicData])))
        //     occurrencePerYear = countOccurrencesPerGroupPerYear(filteredData, keysToRespondWith, requestBody.groupBy, groupedByValues, 'StichtagDatJahr')
        // } else {
        // }
        occurrencePerYear = sortKeysBySumOfArrays(countOccurrencesPerYearMultipleKeys(filteredData, keysToRespondWith, 'StichtagDatJahr', yearRange?.yearsIncluded || []), selection.sortAsc);
        const populationInYears = populationPerYear(filteredData, 'AnzBestWir', 'StichtagDatJahr', yearRange?.yearsIncluded || []);

        aggregatedResult = {
            returned: filteredData.length,
            yearRange,
            population: populationInYears,
            groupedByValues,
            result: occurrencePerYear
        };
    } else {
        let occurrenceCount: ResultType | ResultTypeWithArrays
        let groupedByValues: (string | number)[] = [];
        // if (requestBody.groupBy && requestBody.groupBy in filteredData[0]) {
        //     groupedByValues = Array.from(new Set(filteredData.map(item => item[requestBody.groupBy as keyof DemographicData])))
        //     occurrenceCount = countOccurrencesPerGroupMultipleKeys(filteredData, keysToRespondWith, requestBody.groupBy as keyof DemographicData, groupedByValues);
        // } else {
        // }
        occurrenceCount = sortResultEntriesByValues(countOccurrencesForMultipleKeys(filteredData, keysToRespondWith), selection.sortAsc);
        const populationComplete = filteredData.reduce((acc, curr) => acc + (intOrUndefined(curr.AnzBestWir) || 0), 0);

        aggregatedResult = {
            returned: filteredData.length,
            yearRange,
            population: populationComplete,
            groupedByValues,
            result: occurrenceCount
        };

    }
    return aggregatedResult
};