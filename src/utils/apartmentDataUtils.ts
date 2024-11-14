import {Request} from 'express';
import {ApartmentDataRequest} from "../models/request/apartmentDataRequest";
import {intOrUndefined, isNumber, numberOrUndefined} from "./numberUtils";
import {ApartmentData} from "../models/ApartmentData";

export const apartmentDataKeyMap: Record<string, keyof ApartmentData> = {
    year: 'StichtagDatJahr',
    datenstand: 'DatenstandCd',
    neighborhood: 'QuarLang',
    kreis: 'KreisLang',
    owner: 'EigentuemerSSZPubl1Lang',
    rooms: 'AnzZimmerLevel2Lang_noDM',
    apartmentNumber: 'AnzWhgStat'
}

export const bodyToApartmentDataRequest = (req: Request): ApartmentDataRequest => {
    const {
        startYear,
        endYear,
        year,
        kreis,
        quar,
        minRooms,
        maxRooms,
        rooms,
        owner,
        numberOfApartments,
        groupBy = []
    } = req.body || {};

    return {
        startYear: intOrUndefined(startYear),
        endYear: intOrUndefined(endYear),
        year: intOrUndefined(year),
        kreis: intOrUndefined(kreis),
        quar,
        minRooms: intOrUndefined(minRooms),
        maxRooms: intOrUndefined(maxRooms),
        rooms: intOrUndefined(rooms),
        owner,
        numberOfApartments: intOrUndefined(numberOfApartments),
        groupBy: (groupBy as string[])
            .map(item => apartmentDataKeyMap[item] || item as keyof ApartmentData)
            .filter(Boolean)
    };
}

export const filterApartmentData = (data: ApartmentData[], request: ApartmentDataRequest): ApartmentData[] => {
    return data.filter(item => {
        const {
            startYear,
            endYear,
            year,
            quar,
            kreis,
            minRooms,
            maxRooms,
            rooms,
            owner,
            numberOfApartments,
        } = request;

        const startYearInt = intOrUndefined(startYear);
        const endYearInt = intOrUndefined(endYear);
        const yearInt = intOrUndefined(year);

        if (isNumber(item.StichtagDatJahr) && (startYearInt || endYearInt || yearInt)) {
            const itemYear = intOrUndefined(item.StichtagDatJahr)!;
            if (yearInt && itemYear !== yearInt) return false;
            if (startYearInt && itemYear < startYearInt) return false;
            if (endYearInt && itemYear > endYearInt) return false;
        }

        if (kreis && numberOrUndefined(item.KreisCd) !== kreis) return false;

        if (isNumber(item.AnzZimmerLevel2Cd_noDM) && (rooms || minRooms || maxRooms)) {
            const roomsInt = intOrUndefined(item.AnzZimmerLevel2Cd_noDM)!;
            if (rooms && roomsInt !== rooms) return false;
            if (minRooms && roomsInt < minRooms) return false;
            if (maxRooms && roomsInt > maxRooms) return false;
        }
        if (owner && item.EigentuemerSSZPubl1Lang !== owner) return false;
        if (numberOfApartments && intOrUndefined(item.AnzWhgStat) !== numberOfApartments) return false;
        if (quar && !item.QuarLang.includes(quar)) return false;

        return true;
    });
}

