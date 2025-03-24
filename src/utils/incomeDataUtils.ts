import {Request} from "express";
import {intOrUndefined, numberOrUndefined} from "./numberUtils";
import {IncomeDataRequest} from "../models/request/incomeDataRequest";
import {toValidString} from "./stringUtils";
import {IncomeData} from "../models/incomeData";
import {mapItemsAsKeys} from "./dataUtils";

export const bodyToIncomeDataRequest = (req: Request): IncomeDataRequest => {
    const {
        startYear,
        endYear,
        year,
        district,
        householdType,
        medianIncome,
        groupBy = []
    } = req.body || {};

    return {
        startYear: intOrUndefined(startYear),
        endYear: intOrUndefined(endYear),
        year: intOrUndefined(year),
        district: toValidString(district),
        householdType: toValidString(householdType),
        medianIncome: numberOrUndefined(medianIncome),
        groupBy: mapItemsAsKeys(groupBy, incomeKeyMap)
    };
};

export const incomeKeyMap: Record<string, keyof IncomeData> = {
    year: "Datum_nach_Jahr",
    district: "Stadtquartier",
    householdType: "Haushaltstyp",
    medianIncome: "Haushaltsäquivalenzeinkommen_Median_in_1000_CHF"
}

/**
 * Filters the provided income data based on the criteria specified in the request object.
 * @param data - Array of IncomeData objects to be filtered.
 * @param req - IncomeDataRequest object containing the filtering criteria.
 * @returns Array of filtered IncomeData objects.
 */
export const filterIncomeData = (data: IncomeData[], req: IncomeDataRequest): IncomeData[] =>
    data.filter((item) => {
        const intYear = intOrUndefined(item.Datum_nach_Jahr);

        const matchesStartYear = intYear && req.startYear ? intYear >= req.startYear : true;
        const matchesEndYear = intYear && req.endYear ? intYear <= req.endYear : true;
        const matchesYear = intYear && req.year ? intYear === req.year : true;
        const matchesDistrict = req.district ? item.Stadtquartier === req.district : true;
        const matchesHouseholdType = req.householdType ? item.Haushaltstyp === req.householdType : true;
        const matchesMedianIncome = req.medianIncome ? item.Haushaltsäquivalenzeinkommen_Median_in_1000_CHF === req.medianIncome : true;

        return matchesStartYear &&
            matchesEndYear &&
            matchesYear &&
            matchesDistrict &&
            matchesHouseholdType &&
            matchesMedianIncome;
    });