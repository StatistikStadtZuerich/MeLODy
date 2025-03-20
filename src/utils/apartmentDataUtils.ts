import {Request} from 'express';
import {ApartmentDataRequest} from "../models/request/apartmentDataRequest";
import {intOrUndefined} from "./numberUtils";
import {ApartmentData} from "../models/ApartmentData";
import {mapItemsAsKeys} from "./dataUtils";

export const apartmentDataKeyMap: Record<string, keyof ApartmentData> = {
    year: 'Datum_nach_Jahr',
    neighborhood: 'Stadtquartier',
    rooms: 'Zimmerzahl',
    ownership: 'Eigentumsart',
    constructionPeriod: 'Bauperiode',
    rentOrOwnership: 'Miete_oder_Eigentum',
    apartmentNumber: 'Anzahl_Wohnungen'
}

export const bodyToApartmentDataRequest = (req: Request): ApartmentDataRequest => {
    const {
        startYear,
        endYear,
        year,
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
        quar,
        minRooms: intOrUndefined(minRooms),
        maxRooms: intOrUndefined(maxRooms),
        rooms: intOrUndefined(rooms),
        owner,
        numberOfApartments: intOrUndefined(numberOfApartments),
        groupBy: mapItemsAsKeys(groupBy, apartmentDataKeyMap)
    };
}

export const filterApartmentData = (data: ApartmentData[], request: ApartmentDataRequest): ApartmentData[] => {
    const {
        startYear,
        endYear,
        year,
        quar,
        minRooms,
        maxRooms,
        rooms,
        owner,
        numberOfApartments,
    } = request;
    const startYearInt = intOrUndefined(startYear);
    const endYearInt = intOrUndefined(endYear);
    const yearInt = intOrUndefined(year);

    return data.filter(item => {
        // Filter by year
        if (yearInt || startYearInt || endYearInt) {
            const itemYear = intOrUndefined(item.Datum_nach_Jahr);
            if (itemYear) {
                if (yearInt && itemYear !== yearInt) return false;
                if (startYearInt && itemYear < startYearInt) return false;
                if (endYearInt && itemYear > endYearInt) return false;
            }
        }

        // Filter by district/quarter
        if (quar && !item.Stadtquartier.includes(quar)) return false;

        // Filter by rooms
        if (rooms || minRooms || maxRooms) {
            // Assuming Zimmerzahl can be converted to a number for comparison
            const roomsNum = parseInt(item.Zimmerzahl);
            if (!isNaN(roomsNum)) {
                if (rooms && roomsNum !== rooms) return false;
                if (minRooms && roomsNum < minRooms) return false;
                if (maxRooms && roomsNum > maxRooms) return false;
            }
        }

        // Filter by ownership type
        if (owner && item.Eigentumsart !== owner) return false;

        // Filter by number of apartments
        if (numberOfApartments && item.Anzahl_Wohnungen !== numberOfApartments) return false;

        return true;
    });
}