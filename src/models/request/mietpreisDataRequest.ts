import {MietpreisData} from "../mietpreisData";

/**
 * @swagger
 * components:
 *   schemas:
 *     MietpreisDataRequest:
 *       type: object
 *       description: Filter options for rental price data queries including time ranges, area specifications, room configurations, property types, and grouping dimensions.
 *       properties:
 *         startYear:
 *           type: integer
 *           example: 2020
 *         endYear:
 *           type: integer
 *           example: 2021
 *         year:
 *           type: integer
 *           example: 2022
 *         areaType:
 *           type: string
 *           enum: ['Ganze Stadt', 'Stadtkreise', 'Stadtquartiere', 'Statistische Quartiere']
 *           example: 'Ganze Stadt'
 *         minNumberOfRooms:
 *           type: integer
 *           example: 2
 *           minimum: 1
 *         maxNumberOfRooms:
 *           type: integer
 *           minimum: 1
 *         numberOfRooms:
 *           type: integer
 *           minimum: 1
 *         gemein:
 *           type: string
 *           enum: ['Gemeinnützig', 'Nicht gemeinnützig']
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