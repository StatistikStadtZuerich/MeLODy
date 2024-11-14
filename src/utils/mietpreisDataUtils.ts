import {MietpreisDataRequest} from "../models/request/mietpreisDataRequest";
import {Request} from "express";
import {intOrUndefined, isNumber} from "./numberUtils";
import {MietpreisData} from "../models/mietpreisData";
import {parseMonthFromString} from "./dateUtils";

export const mietPreisKeyMap: Record<string, keyof MietpreisData> = {
    year: "StichtagDatJahr",
    month: "StichtagDatMonat",
    roomUnitDesc: "RaumeinheitLang",
    structureDesc: "GliederungLang",
    roomDesc: "ZimmerLang",
    nonProfitDesc: "GemeinnuetzigLang",
    unitDesc: "EinheitLang",
    priceTypeDesc: "PreisartLang",
    mean: "mean",
    meanLower: "meanl",
    meanUpper: "meanu",
    quantile10: "qu10",
    quantile10Lower: "qu10l",
    quantile10Upper: "qu10u",
    quantile25: "qu25",
    quantile25Lower: "qu25l",
    quantile25Upper: "qu25u",
    quantile50: "qu50",
    quantile50Lower: "qu50l",
    quantile50Upper: "qu50u",
    quantile75: "qu75",
    quantile75Lower: "qu75l",
    quantile75Upper: "qu75u",
    quantile90: "qu90",
    quantile90Lower: "qu90l",
    quantile90Upper: "qu90u",
    domain: "Domain",
    sample1: "Sample1",
    sample2: "Sample2"
};

export const bodyToMietpreisRequest = (req: Request): MietpreisDataRequest => {
    const {
        startYear,
        endYear,
        startMonth,
        endMonth,
        year,
        month,
        areaType,
        categoryType,
        kreis,
        minNumberOfRooms,
        maxNumberOfRooms,
        numberOfRooms,
        groupBy = [],
        gemein,
        messung,
        bruttoNetto
    } = req.body || {};

    return {
        startYear: intOrUndefined(startYear),
        endYear: intOrUndefined(endYear),
        startMonth: intOrUndefined(startMonth),
        endMonth: intOrUndefined(endMonth),
        year: intOrUndefined(year),
        month: intOrUndefined(month),
        areaType,
        categoryType,
        kreis: intOrUndefined(kreis),
        minNumberOfRooms: intOrUndefined(minNumberOfRooms),
        maxNumberOfRooms: intOrUndefined(maxNumberOfRooms),
        numberOfRooms: intOrUndefined(numberOfRooms),
        groupBy: (groupBy as string[]).map(item => mietPreisKeyMap[item] || item as keyof MietpreisData).filter(Boolean),
        gemein,
        messung,
        bruttoNetto
    };
}

export const filterMietpreisData = (data: MietpreisData[], request: MietpreisDataRequest): MietpreisData[] => {
    return data.filter(item => {
        const {
            startYear,
            endYear,
            year,
            month,
            startMonth,
            endMonth,
            areaType,
            categoryType,
            kreis,
            minNumberOfRooms,
            maxNumberOfRooms,
            numberOfRooms,
            gemein,
            messung,
            bruttoNetto,
        } = request;

        const startYearInt = intOrUndefined(startYear);
        const endYearInt = intOrUndefined(endYear);
        const yearInt = intOrUndefined(year);

        const monthAsInt = parseMonthFromString(item.StichtagDatMonat, "yyyy.MM")

        if (isNumber(item.StichtagDatJahr) && (startYearInt || endYearInt || yearInt)) {
            const itemYear = intOrUndefined(item.StichtagDatJahr)!;
            if (year && itemYear !== year) return false;
            if (startYearInt && itemYear < startYearInt) return false;
            if (endYearInt && itemYear > endYearInt) return false;
        }
        if (monthAsInt && (month || startMonth || endMonth)) {
            if (month && monthAsInt !== month) return false;
            if (startMonth && monthAsInt < startMonth) return false;
            if (endMonth && monthAsInt > endMonth) return false;
        }

        if (areaType && item.RaumeinheitLang !== areaType) return false;
        if (categoryType && !item.GemeinnuetzigLang.includes(categoryType)) return false;
        if (categoryType && categoryType === 'Kreis' && kreis && item.GemeinnuetzigLang !== `${categoryType} ${kreis}`) return false;

        if (isNumber(item.ZimmerSort) && (numberOfRooms || minNumberOfRooms || maxNumberOfRooms)) {
            const numberOfRoomsInt = intOrUndefined(item.ZimmerSort)!;
            if (numberOfRooms && numberOfRoomsInt !== numberOfRooms) return false;
            if (minNumberOfRooms && numberOfRoomsInt < minNumberOfRooms) return false;
            if (maxNumberOfRooms && numberOfRoomsInt > maxNumberOfRooms) return false;
        }
        if (gemein && item.GemeinnuetzigLang !== gemein) return false;
        if (messung && item.EinheitLang !== messung) return false;
        if (bruttoNetto && item.PreisartLang !== bruttoNetto) return false;

        return true;
    });
};