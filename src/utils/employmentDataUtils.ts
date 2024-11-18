import {Request} from 'express';
import {EmploymentDataRequest} from "../models/request/employmentDataRequest";
import {intOrUndefined} from "./numberUtils";
import {EmploymentData} from "../models/employmentData";
import {mapItemsAsKeys} from "./dataUtils";

export const employmentKeyMap: Record<string, keyof EmploymentData> = {
    year: "Jahr",
    quarter: "Quartal",
    allEmployed: "AnzBeschaeftigte_noDM",
    fullTime: "vza_noDM"
}

export const bodyToEmploymentData = (req: Request): EmploymentDataRequest => {
    const {
        startYear,
        endYear,
        year,
        quartal,
        startQuartal,
        endQuartal,
        groupBy = []
    } = req.body || {};

    return {
        startYear: intOrUndefined(startYear),
        endYear: intOrUndefined(endYear),
        year: intOrUndefined(year),
        quartal: intOrUndefined(quartal),
        startQuartal: intOrUndefined(startQuartal),
        endQuartal: intOrUndefined(endQuartal),
        groupBy: mapItemsAsKeys(groupBy, employmentKeyMap)
    };
}

export const filterEmploymentData = (data: EmploymentData[], request: EmploymentDataRequest): EmploymentData[] => {
    return data.filter(item => {
        const yearAsInt = intOrUndefined(item.Jahr);
        const quartalAsInt = intOrUndefined(item.Quartal);
        if (yearAsInt === undefined || quartalAsInt === undefined) {
            return false;
        }

        const matchesYear = request.year === undefined || yearAsInt === request.year;
        const matchesStartYear = request.startYear === undefined || yearAsInt >= request.startYear;
        const matchesStartQuartal = request.startQuartal === undefined || quartalAsInt >= request.startQuartal;


        const matchesQuartal = request.quartal === undefined || quartalAsInt === request.quartal;
        const matchesEndYear = request.endYear === undefined || yearAsInt <= request.endYear;
        const matchesEndQuartal = request.endQuartal === undefined || quartalAsInt <= request.endQuartal;

        return matchesYear && matchesQuartal && matchesStartYear && matchesEndYear && matchesStartQuartal && matchesEndQuartal;
    });
}