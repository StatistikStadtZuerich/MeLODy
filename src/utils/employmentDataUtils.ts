import {Request} from 'express';
import {EmploymentDataRequest} from "../models/request/employmentDataRequest";
import {intOrUndefined} from "./numberUtils";
import {EmploymentData} from "../models/employmentData";
import {mapItemsAsKeys} from "./dataUtils";

export const employmentKeyMap: Record<string, keyof EmploymentData> = {
    datum: "Datum_nach_Quartal",
    allEmployed: "Anzahl_Beschaeftigte",
    fullTime: "Beschaeftigungsgrad"
}

export const bodyToEmploymentData = (req: Request): EmploymentDataRequest => {
    const {
        startDate,
        endDate,
        date,
        groupBy = []
    } = req.body || {};

    return {
        startDate: intOrUndefined(startDate),
        endDate: intOrUndefined(endDate),
        date: intOrUndefined(date),
        groupBy: mapItemsAsKeys(groupBy, employmentKeyMap)
    };
}

export const filterEmploymentData = (data: EmploymentData[], request: EmploymentDataRequest): EmploymentData[] => {
    return data.filter(item => {
        const date = new Date(item.Datum_nach_Quartal).getFullYear();
        if (isNaN(date)) {
            return false;
        }

        const matchesYear = request.date === undefined || date === request.date;
        const matchesStartYear = request.startDate === undefined || date >= request.startDate;
        const matchesEndYear = request.endDate === undefined || date <= request.endDate;

        return matchesYear && matchesStartYear && matchesEndYear;
    });
}