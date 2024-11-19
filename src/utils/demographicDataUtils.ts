import {DemographicData} from "../models/demographicData";
import {intOrUndefined, isNumber} from "./numberUtils";
import {Request} from 'express';

import {DemographicDataRequestQueryFilter} from "../models/request/demographicDataRequest";
import {mapItemsAsKeys} from "./dataUtils";


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
