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
 *         month:
 *           type: integer
 *           description: A specific month for the request
 *           example: 8
 *           minimum: 1
 *           maximum: 12
 *         startMonth:
 *           type: integer
 *           description: The start month of the request
 *           example: 1
 *           minimum: 1
 *           maximum: 12
 *         endMonth:
 *           type: integer
 *           description: The end month of the request
 *           example: 12
 *           minimum: 1
 *           maximum: 12
 *         areaType:
 *           type: string
 *           enum: ['Ganze Stadt', 'Stadtkreise', 'Stadtquartiere', 'Statistische Quartiere']
 *           description: Type of area
 *           example: 'Ganze Stadt'
 *         categoryType:
 *           type: string
 *           enum: ['Ganze Stadt', 'Neubau bis 2 Jahre', 'Neubezug bis 2 Jahre', 'Bestand Mietverträge 2–10 Jahre', 'Bestand Mietverträge 11-20 Jahre', 'Bestand Mietverträge über 20 Jahre', 'Kreis']
 *           description: Category type of the request
 *           example: 'Neubau bis 2 Jahre'
 *         kreis:
 *           type: integer
 *           description: The kreis value
 *           example: 5
 *           minimum: 1
 *           maximum: 12
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
 *         messung:
 *           type: string
 *           enum: ['Quadratmeter', 'Wohnung']
 *           description: Indicates if it is priced by the whole flat or in square meter
 *           example: 'Wohnung'
 *         bruttoNetto:
 *           type: string
 *           enum: ['Brutto', 'Netto']
 *           description: Indicates if it is priced in gross or net
 *           example: 'Brutto'
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *             enum: [
 *               'StichtagDatJahr',
 *               'StichtagDatMonat',
 *               'RaumeinheitLang',
 *               'GliederungLang',
 *               'ZimmerLang',
 *               'GemeinnuetzigLang',
 *               'EinheitLang',
 *               'PreisartLang',
 *               'mean',
 *               'meanl',
 *               'meanu',
 *               'qu10',
 *               'qu10l',
 *               'qu10u',
 *               'qu25',
 *               'qu25l',
 *               'qu25u',
 *               'qu50',
 *               'qu50l',
 *               'qu50u',
 *               'qu75',
 *               'qu75l',
 *               'qu75u',
 *               'qu90',
 *               'qu90l',
 *               'qu90u',
 *               'Domain',
 *               'Sample1',
 *               'Sample2'
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