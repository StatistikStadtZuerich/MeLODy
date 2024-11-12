"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterIncomeData = exports.incomeKeyMap = exports.bodyToIncomeDataRequest = exports.mapQueryToIncomeDataRequest = void 0;
const numberUtils_1 = require("./numberUtils");
const stringUtils_1 = require("./stringUtils");
const mapQueryToIncomeDataRequest = (req) => {
    const { startYear, endYear, year, quar, tarif, taxIncome_p50, taxIncome_p25, taxIncome_p75, groupBy = [] } = req.query;
    return {
        startYear: (0, numberUtils_1.intOrUndefined)(startYear),
        endYear: (0, numberUtils_1.intOrUndefined)(endYear),
        year: (0, numberUtils_1.intOrUndefined)(year),
        quar: (0, stringUtils_1.toValidString)(quar),
        tarif: (0, stringUtils_1.toValidString)(tarif),
        taxIncome_p50: (0, numberUtils_1.numberOrUndefined)(taxIncome_p50),
        taxIncome_p25: (0, numberUtils_1.numberOrUndefined)(taxIncome_p25),
        taxIncome_p75: (0, numberUtils_1.numberOrUndefined)(taxIncome_p75),
        groupBy: groupBy.map(item => exports.incomeKeyMap[item]).filter(Boolean)
        // responseKeys: responseKeys ? (responseKeys as string[]).map(key => key.toString()) : [],
        // groupBy: groupBy?.toString()?.trim() as keyof DemographicData | undefined
    };
};
exports.mapQueryToIncomeDataRequest = mapQueryToIncomeDataRequest;
const bodyToIncomeDataRequest = (req) => {
    const { startYear, endYear, year, quar, tarif, taxIncome_p50, taxIncome_p25, taxIncome_p75, groupBy = [] } = req.body || {};
    return {
        startYear: (0, numberUtils_1.intOrUndefined)(startYear),
        endYear: (0, numberUtils_1.intOrUndefined)(endYear),
        year: (0, numberUtils_1.intOrUndefined)(year),
        quar: (0, stringUtils_1.toValidString)(quar),
        tarif: (0, stringUtils_1.toValidString)(tarif),
        taxIncome_p50: (0, numberUtils_1.numberOrUndefined)(taxIncome_p50),
        taxIncome_p25: (0, numberUtils_1.numberOrUndefined)(taxIncome_p25),
        taxIncome_p75: (0, numberUtils_1.numberOrUndefined)(taxIncome_p75),
        groupBy: groupBy.map(item => exports.incomeKeyMap[item]).filter(Boolean)
        // responseKeys: responseKeys ? (responseKeys as string[]).map(key => key.toString()) : [],
        // groupBy: groupBy?.toString()?.trim() as keyof DemographicData | undefined
    };
};
exports.bodyToIncomeDataRequest = bodyToIncomeDataRequest;
exports.incomeKeyMap = {
    year: "StichtagDatJahr",
    quar: "QuarLang",
    tarif: 'SteuerTarifLang',
    taxIncome_p50: 'SteuerEinkommen_p50',
    taxIncome_p25: 'SteuerEinkommen_p25',
    taxIncome_p75: 'SteuerEinkommen_p75',
};
/**
 * Filters the provided income data based on the criteria specified in the request object.
 * @param data - Array of IncomeData objects to be filtered.
 * @param req - IncomeDataRequest object containing the filtering criteria.
 * @returns Array of filtered IncomeData objects.
 */
const filterIncomeData = (data, req) => data.filter((item) => {
    const intYear = (0, numberUtils_1.intOrUndefined)(item.StichtagDatJahr);
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
exports.filterIncomeData = filterIncomeData;
