import {ApartmentData} from "../ApartmentData";

/**
 // * @swagger
 * components:
 *   schemas:
 *     ApartmentDataRequest:
 *       type: object
 *       description: Filter options for apartment data queries including time range, location, room specifications, ownership type, apartment count, and grouping dimensions.
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
 *         minRooms:
 *           type: integer
 *           minimum: 1
 *         maxRooms:
 *           type: integer
 *           minimum: 1
 *         rooms:
 *           type: integer
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
 *           minimum: 1
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - 'Datum_nach_Jahr'
 *               - 'Stadtquartier'
 *               - 'Zimmerzahl'
 *               - 'Eigentumsart'
 *               - 'Bauperiode'
 *               - 'Miete_oder_Eigentum'
 *               - 'Anzahl_Wohnungen'
 *           example: ['Datum_nach_Jahr', 'Stadtquartier']
 */
export interface ApartmentDataRequest {
    startYear?: number;
    endYear?: number;
    year?: number;
    quar?: string;
    minRooms?: number;
    maxRooms?: number;
    rooms?: number;
    owner?: 'Öffentliche Hand' | 'Übrige private Gesellschaften' | 'Natürliche Personen' | 'Im Stockwerkeigentum' | 'Wohnbaugenossenschaften'
    numberOfApartments?: number;
    groupBy: (keyof ApartmentData)[];
}