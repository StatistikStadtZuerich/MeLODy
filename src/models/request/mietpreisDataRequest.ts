import {MietpreisData} from "../mietpreisData";

/**
 * @swagger
 * components:
 *   schemas:
 *     MietpreisDataRequest:
 *       type: object
 *       properties:
 *         startYear:
 *           type: integer
 *           description: The start year of the request
 *           example: 2020
 *         endYear:
 *           type: integer
 *           description: The end year of the request
 *           example: 2021
 *         year:
 *           type: integer
 *           description: A specific year for the request
 *           example: 2022
 *         areaType:
 *           type: string
 *           enum: ['Ganze Stadt', 'Stadtkreise', 'Stadtquartiere', 'Statistische Quartiere']
 *           description: Type of area
 *           example: 'Ganze Stadt'
 *         minNumberOfRooms:
 *           type: integer
 *           description: Minimum number of rooms
 *           example: 2
 *           minimum: 1
 *         maxNumberOfRooms:
 *           type: integer
 *           description: Maximum number of rooms
 *           example: 4
 *           minimum: 1
 *         numberOfRooms:
 *           type: integer
 *           description: Specific number of rooms
 *           example: 3
 *           minimum: 1
 *         gemein:
 *           type: string
 *           enum: ['Gemeinnützig', 'Nicht gemeinnützig']
 *           description: Indicates if it is profit
 *           example: 'Gemeinnützig'
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *             enum: [
 *               'StichtagDatJahr',
 *               'StichtagDatMonat',
 *               'RaumeinheitLang',
 *               'ZimmerLang',
 *               'GemeinnuetzigLang',
 *               'mean',
 *               'qu25',
 *               'qu50',
 *               'qu75',
 *             ]
 *           description: Grouping fields
 *           example: ['StichtagDatJahr', 'ZimmerSort']
 */
export interface MietpreisDataRequest {
    startYear?: number;
    endYear?: number;
    year?: number;
    month?: number;
    startMonth?: number;
    endMonth?: number;
    areaType?: 'Ganze Stadt' | 'Stadtkreise' | 'Stadtquartiere' | 'Statistische Quartiere';
    categoryType?: 'Ganze Stadt' | 'Neubau bis 2 Jahre' | 'Neubezug bis 2 Jahre' | 'Bestand Mietverträge 2–10 Jahre' | 'Bestand Mietverträge 11-20 Jahre' | 'Bestand Mietverträge über 20 Jahre' | 'Kreis';
    kreis?: number;
    minNumberOfRooms?: number;
    maxNumberOfRooms?: number;
    numberOfRooms?: number;
    gemein?: 'Gemeinnützig' | 'Nicht gemeinnützig';
    messung?: 'Quadratmeter' | 'Wohnung';
    bruttoNetto?: 'Brutto' | 'Netto';
    groupBy: (keyof MietpreisData)[];
}