import {DemographicData} from "../demographicData";

/**
 // * @swagger
 * components:
 *   schemas:
 *     DemographicDataRequestQueryFilter:
 *       type: object
 *       description: Filter options for demographic data queries including time range, demographic characteristics, location, and population metrics. Supports grouping results by various dimensions.
 *       properties:
 *         startYear:
 *           type: integer
 *           example: 2000
 *         endYear:
 *           type: integer
 *           example: 2020
 *         year:
 *           type: integer
 *           example: 2010
 *         geschlecht:
 *           type: string
 *           example: 'männlich'
 *         alter:
 *           type: string
 *           example: '20-24'
 *         stadtquartier:
 *           type: string
 *           example: 'Fluntern'
 *         heimatland:
 *           type: string
 *           example: 'Schweiz'
 *         minWirtschaftlicheWohnbevoelkerung:
 *           type: number
 *           example: 100
 *         maxWirtschaftlicheWohnbevoelkerung:
 *           type: number
 *           example: 1000
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *           example: ['Datum_nach_Jahr', 'Geschlecht']
 *           enum: [Datum_nach_Jahr, Stadtquartier, Alter, Heimatland, Geschlecht, Wirtschaftliche_Wohnbevoelkerung]
 */
export interface DemographicDataRequestQueryFilter {
    startYear?: number;
    endYear?: number;
    year?: number;
    geschlecht?: string;
    alter?: string;
    stadtquartier?: string;
    heimatland?: string;
    wirtschaftlicheWohnbevoelkerung?: number;
    minWirtschaftlicheWohnbevoelkerung?: number;
    maxWirtschaftlicheWohnbevoelkerung?: number;
    groupBy: (keyof DemographicData)[];
}