import {Request} from "express";
import {intOrUndefined, numberOrUndefined} from "./numberUtils";
import {IncomeDataRequest} from "../models/request/incomeDataRequest";
import {toValidString} from "./stringUtils";
import {IncomeData} from "../models/incomeData";

export const mapQueryToIncomeDataRequest = (req: Request): IncomeDataRequest => {
    const {
        startYear,
        endYear,
        year,
        quar,
        tarif,
        taxIncome_p50,
        taxIncome_p25,
        taxIncome_p75,
        groupBy = []
    } = req.query;


    return {
        startYear: intOrUndefined(startYear),
        endYear: intOrUndefined(endYear),
        year: intOrUndefined(year),
        quar: toValidString(quar as string),
        tarif: toValidString(tarif as string),
        taxIncome_p50: numberOrUndefined(taxIncome_p50),
        taxIncome_p25: numberOrUndefined(taxIncome_p25),
        taxIncome_p75: numberOrUndefined(taxIncome_p75),
        groupBy: (groupBy as string[]).map(item => incomeKeyMap[item]).filter(Boolean)
        // responseKeys: responseKeys ? (responseKeys as string[]).map(key => key.toString()) : [],
        // groupBy: groupBy?.toString()?.trim() as keyof DemographicData | undefined
    };
};

export const bodyToIncomeDataRequest = (req: Request): IncomeDataRequest => {
    const {
        startYear,
        endYear,
        year,
        quar,
        tarif,
        taxIncome_p50,
        taxIncome_p25,
        taxIncome_p75,
        groupBy = []
    } = req.body || {};


    return {
        startYear: intOrUndefined(startYear),
        endYear: intOrUndefined(endYear),
        year: intOrUndefined(year),
        quar: toValidString(quar),
        tarif: toValidString(tarif),
        taxIncome_p50: numberOrUndefined(taxIncome_p50),
        taxIncome_p25: numberOrUndefined(taxIncome_p25),
        taxIncome_p75: numberOrUndefined(taxIncome_p75),
        groupBy: (groupBy as string[]).map(item => incomeKeyMap[item]).filter(Boolean)
        // responseKeys: responseKeys ? (responseKeys as string[]).map(key => key.toString()) : [],
        // groupBy: groupBy?.toString()?.trim() as keyof DemographicData | undefined
    };
};

export const incomeKeyMap: Record<string, keyof IncomeData> = {
    year: "StichtagDatJahr",
    quar: "QuarLang",
    tarif: 'SteuerTarifLang',
    taxIncome_p50: 'SteuerEinkommen_p50',
    taxIncome_p25: 'SteuerEinkommen_p25',
    taxIncome_p75: 'SteuerEinkommen_p75',
}


/**
 * Filters the provided income data based on the criteria specified in the request object.
 * @param data - Array of IncomeData objects to be filtered.
 * @param req - IncomeDataRequest object containing the filtering criteria.
 * @returns Array of filtered IncomeData objects.
 */
export const filterIncomeData = (data: IncomeData[], req: IncomeDataRequest): IncomeData[] =>
    data.filter((item) => {
        const intYear = intOrUndefined(item.StichtagDatJahr);

        const matchesStartYear = intYear && req.startYear ? intYear >= req.startYear : true;
        const matchesEndYear = intYear && req.endYear ? intYear <= req.endYear : true;
        const matchesYear = intYear && req.year ? intYear === req.year : true;
        const matchesQuarter = req.quar ? item.QuarLang === req.quar : true;
        const matchesTarif = req.tarif ? item.SteuerTarifLang === req.tarif : true;
        const matchesTaxIncomeP50 = req.taxIncome_p50 ? item.SteuerEinkommen_p50 === req.taxIncome_p50 : true;
        const matchesTaxIncomeP25 = req.taxIncome_p25 ? item.SteuerEinkommen_p25 === req.taxIncome_p25 : true;
        const matchesTaxIncomeP75 = req.taxIncome_p75 ? item.SteuerEinkommen_p75 === req.taxIncome_p75 : true;

        return matchesStartYear &&
            matchesEndYear &&
            matchesYear &&
            matchesQuarter &&
            matchesTarif &&
            matchesTaxIncomeP50 &&
            matchesTaxIncomeP25 &&
            matchesTaxIncomeP75;
    });