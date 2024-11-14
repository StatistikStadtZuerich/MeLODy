import {ApartmentData} from "../ApartmentData";

/**
 * @swagger
 * components:
 *   schemas:
 *     ApartmentDataRequest:
 *       type: object
 *       properties:
 *         startYear:
 *           type: integer
 *           example: 2020
 *         endYear:
 *           type: integer
 *           example: 2025
 *         year:
 *           type: integer
 *           example: 2021
 *         quar:
 *           type: string
 *           example: "Rathaus"
 *         kreis:
 *           type: integer
 *           example: 1
 *           minimum: 1
 *           maximum: 12
 *         minRooms:
 *           type: integer
 *           example: 1
 *           minimum: 1
 *         maxRooms:
 *           type: integer
 *           example: 5
 *           minimum: 1
 *         rooms:
 *           type: integer
 *           example: 3
 *           minimum: 1
 *         owner:
 *           type: string
 *           enum:
 *             - 'Öffentliche Hand'
 *             - 'Übrige private Gesellschaften'
 *             - 'Natürliche Personen'
 *             - 'Im Stockwerkeigentum'
 *             - 'Wohnbaugenossenschaften'
 *           example: 'Natürliche Personen'
 *         numberOfApartments:
 *           type: integer
 *           example: 100
 *           minimum: 1
 *           maximum: 1000
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *           example: [
 *             'StichtagDatJahr',
 *             'DatenstandCd',
 *             'QuarLang',
 *             'KreisLang',
 *             'EigentuemerSSZPubl1Lang',
 *             'AnzZimmerLevel2Lang_noDM',
 *             'AnzWhgStat'
 *           ]
 */
export interface ApartmentDataRequest {
    startYear?: number;
    endYear?: number;
    year?: number;
    quar?: string;
    kreis?: number;
    minRooms?: number;
    maxRooms?: number;
    rooms?: number;
    owner?: 'Öffentliche Hand' | 'Übrige private Gesellschaften' | 'Natürliche Personen' | 'Im Stockwerkeigentum' | 'Wohnbaugenossenschaften'
    numberOfApartments?: number;
    groupBy: (keyof ApartmentData)[];
}