/**
 * @swagger
 * components:
 *   schemas:
 *     DemographicDataRequest:
 *       type: object
 *       properties:
 *         startYear:
 *           type: [string, number]
 *           description: The starting year for filtering data
 *         endYear:
 *           type: [string, number]
 *           description: The ending year for filtering data
 *         year:
 *           type: [string, number]
 *           description: A specific year for filtering data
 *         Kreis:
 *           type: string
 *           description: The district for filtering data
 *         Quar:
 *           type: string
 *           description: The neighborhood for filtering data
 *         Alter:
 *           type: string
 *           description: The age category for filtering data
 *         Sex:
 *           type: string
 *           description: The gender for filtering data
 *         Herkunft:
 *           type: string
 *           description: The origin for filtering data
 *         minResidents:
 *           type: [string, number]
 *           description: The minimum number of residents for filtering data
 *         maxResidents:
 *           type: [string, number]
 *           description: The maximum number of residents for filtering data
 *         groupBy:
 *           type: string
 *           enum:
 *             - AlterVCd
 *             - AlterVKurz
 *             - AlterV05Sort
 *             - AlterV05Cd
 *             - AlterV05Kurz
 *             - AlterV10Cd
 *             - AlterV10Kurz
 *             - AlterV20Cd
 *             - AlterV20Kurz
 *             - SexLang
 *             - SexKurz
 *             - KreisLang
 *             - QuarLang
 *             - HerkunftLang
 *           description: A key of DemographicData to group the results by
 */
import {DemographicData} from "../demographicData";

export interface DemographicDataRequest {
    startYear?: number;
    endYear?: number;
    year?: number;
    Kreis?: number;
    Quar?: string;
    minAge?: number;
    maxAge?: number;
    age?: number;
    Sex?: string;
    Herkunft?: string;
    minResidents?: string | number;
    maxResidents?: string | number;
    responseKeys: string[];
    groupBy?: keyof DemographicData;
}


/**
 * @swagger
 * components:
 *   schemas:
 *     DemographicDataRequestQueryFilter:
 *       type: object
 *       properties:
 *         startYear:
 *           type: integer
 *           description: The starting year for filtering data
 *           example: 2000
 *         endYear:
 *           type: integer
 *           description: The ending year for filtering data
 *           example: 2020
 *         year:
 *           type: integer
 *           description: A specific year for filtering data
 *           example: 2010
 *         sex:
 *           type: string
 *           enum: ['M', 'F']
 *           description: The gender for filtering data
 *           example: 'M'
 *         minAge:
 *           type: integer
 *           description: The minimum age for filtering data
 *           example: 18
 *           minimum: 0
 *           maximum: 120
 *         maxAge:
 *           type: integer
 *           description: The maximum age for filtering data
 *           example: 65
 *           minimum: 0
 *           maximum: 120
 *         age:
 *           type: integer
 *           description: The specific age for filtering data
 *           example: 30
 *           minimum: 0
 *           maximum: 120
 *         kreis:
 *           type: integer
 *           description: The district for filtering data
 *           example: 1
 *           minimum: 1
 *           maximum: 12
 *         quar:
 *           type: string
 *           description: The neighborhood for filtering data
 *           example: 'Altstadt'
 *         herkunft:
 *           type: string
 *           enum: ['Schweizer*in', 'Ausländer*in']
 *           description: The origin for filtering data
 *           example: 'Schweizer*in'
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *           description: Fields to group the results by
 *           example: ['year', 'sex']
 *           enum:
 *             - sex
 *             - origin
 *             - year
 *             - kreis
 *             - quar
 *             - age
 *             - age5
 *             - age10
 *             - age 20
 */
export interface DemographicDataRequestQueryFilter {
    startYear?: number;
    endYear?: number;
    year?: number;
    sex?: 'M' | 'F';
    minAge?: number;
    maxAge?: number;
    age?: number;
    kreis?: number;
    quar?: string;
    herkunft?: 'Schweizer*in' | 'Ausländer*in';
    groupBy: string[];
}
