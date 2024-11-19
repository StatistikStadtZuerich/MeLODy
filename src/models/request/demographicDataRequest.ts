import {DemographicData} from "../demographicData";

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
 *             - herkunft
 *             - year
 *             - kreis
 *             - quar
 *             - age
 *             - population
 */
export interface DemographicDataRequestQueryFilter {
    startYear?: number;
    endYear?: number;
    year?: number;
    sex?: 'M' | 'F';
    minAge?: number;
    maxAge?: number;
    age?: number;
    population?: number;
    minPopulation?: number;
    maxPopulation?: number;
    kreis?: number;
    quar?: string;
    herkunft?: 'Schweizer*in' | 'Ausländer*in';
    groupBy: (keyof DemographicData)[];
}
