import {DemographicData} from "../models/demographicData";
import {intOrUndefined} from "./numberUtils";
import {Request} from 'express';

import {DemographicDataRequestQueryFilter} from "../models/request/demographicDataRequest";


export const demographicDataFiltered = (req: DemographicDataRequestQueryFilter, data: DemographicData[]): DemographicData[] => {
    let filteredData = data;
    const {
        startYear,
        endYear,
        year,
        geschlecht,
        alter,
        stadtquartier,
        heimatland,
        minWirtschaftlicheWohnbevoelkerung,
        maxWirtschaftlicheWohnbevoelkerung,
        wirtschaftlicheWohnbevoelkerung,
    } = req;

    if (Object.values(req).every(value => value === undefined)) {
        return filteredData;
    }

    const startYearInt = intOrUndefined(startYear);
    const endYearInt = intOrUndefined(endYear);
    const yearInt = intOrUndefined(year);

    return filteredData.filter(d => {
        const dataYear = parseInt(d.Datum_nach_Jahr);

        if (startYearInt !== undefined && dataYear < startYearInt) {
            return false;
        }

        if (endYearInt !== undefined && dataYear > endYearInt) {
            return false;
        }

        if (yearInt !== undefined && dataYear !== yearInt) {
            return false;
        }

        if (stadtquartier && d.Stadtquartier.toLowerCase() !== stadtquartier.toLowerCase()) {
            return false;
        }

        if (alter && d.Alter !== alter) {
            return false;
        }

        if (geschlecht && d.Geschlecht.toLowerCase() !== geschlecht.toLowerCase()) {
            return false;
        }

        if (heimatland && d.Heimatland.toLowerCase() !== heimatland.toLowerCase()) {
            return false;
        }

        const populationValue = parseInt(d.Wirtschaftliche_Wohnbevoelkerung);

        if (wirtschaftlicheWohnbevoelkerung !== undefined && populationValue !== wirtschaftlicheWohnbevoelkerung) {
            return false;
        }

        if (minWirtschaftlicheWohnbevoelkerung !== undefined && populationValue < minWirtschaftlicheWohnbevoelkerung) {
            return false;
        }

        if (maxWirtschaftlicheWohnbevoelkerung !== undefined && populationValue > maxWirtschaftlicheWohnbevoelkerung) {
            return false;
        }

        return true;
    });
}

const geschlechtString = (geschlecht: unknown): 'männlich' | 'weiblich' | undefined => {
    if (typeof geschlecht === 'string') {
        const lowerCaseGeschlecht = geschlecht.toLowerCase();
        if (lowerCaseGeschlecht === 'm' || lowerCaseGeschlecht === 'männlich') {
            return 'männlich';
        }
        if (lowerCaseGeschlecht === 'f' || lowerCaseGeschlecht === 'weiblich') {
            return 'weiblich';
        }
    }
    return undefined;
}

const heimatlandString = (heimatland: unknown): 'Schweiz' | string | undefined => {
    if (typeof heimatland === 'string') {
        const lowerCaseHeimatland = heimatland.toLowerCase();
        if (lowerCaseHeimatland === 'schweiz') {
            return 'Schweiz';
        }
        return heimatland;
    }
    return undefined;
}

// Helper function to group demographic data by specified fields
export const groupDemographicData = (data: DemographicData[], groupByFields: (keyof DemographicData)[]) => {
    // Implementation of grouping logic would go here
    // This is a placeholder for the actual implementation
    return data;
}


/**
 * A mapping object to translate user-friendly query parameters to their corresponding
 * DemographicData property keys
 */
export const demographicKeyMap: Record<string, keyof DemographicData> = {
    'year': 'Datum_nach_Jahr',
    'stadtquartier': 'Stadtquartier',
    'alter': 'Alter',
    'herkunft': 'Heimatland',
    'geschlecht': 'Geschlecht',
    'bevölkerung': 'Wirtschaftliche_Wohnbevoelkerung'
};

/**
 * Converts Express request body/query to a DemographicDataRequestQueryFilter object
 * @param req Express request object
 * @returns DemographicDataRequestQueryFilter object
 */
export const bodyToDemographicDataRequest = (req: Request): DemographicDataRequestQueryFilter => {
    const {
        startYear,
        endYear,
        year,
        geschlecht,
        alter,
        stadtquartier,
        heimatland,
        wirtschaftlicheWohnbevoelkerung,
        minWirtschaftlicheWohnbevoelkerung,
        maxWirtschaftlicheWohnbevoelkerung,
        groupBy
    } = req.body || {};

    let groupByArray: (keyof DemographicData)[] = [];

    if (Array.isArray(groupBy)) {
        groupByArray = groupBy
            .filter(item => item in demographicKeyMap ? true : demographicKeyMap[item] !== undefined)
            .map(item => demographicKeyMap[item] || item as keyof DemographicData);
    }

    if (groupByArray.length === 0) {
        groupByArray = ['Datum_nach_Jahr']
    }

    const filter: DemographicDataRequestQueryFilter = {
        groupBy: groupByArray
    };

    // Add optional filters when provided
    if (startYear !== undefined) {
        filter.startYear = intOrUndefined(startYear);
    }

    if (endYear !== undefined) {
        filter.endYear = intOrUndefined(endYear);
    }

    if (year !== undefined) {
        filter.year = intOrUndefined(year);
    }

    if (geschlecht !== undefined) {
        filter.geschlecht = geschlecht as string;
    }

    if (alter !== undefined) {
        filter.alter = alter as string;
    }

    if (stadtquartier !== undefined) {
        filter.stadtquartier = stadtquartier as string;
    }

    if (heimatland !== undefined) {
        filter.heimatland = heimatland as string;
    }

    if (wirtschaftlicheWohnbevoelkerung !== undefined) {
        filter.wirtschaftlicheWohnbevoelkerung = intOrUndefined(wirtschaftlicheWohnbevoelkerung);
    }

    if (minWirtschaftlicheWohnbevoelkerung !== undefined) {
        filter.minWirtschaftlicheWohnbevoelkerung = intOrUndefined(minWirtschaftlicheWohnbevoelkerung);
    }

    if (maxWirtschaftlicheWohnbevoelkerung !== undefined) {
        filter.maxWirtschaftlicheWohnbevoelkerung = intOrUndefined(maxWirtschaftlicheWohnbevoelkerung);
    }

    return filter;
};
