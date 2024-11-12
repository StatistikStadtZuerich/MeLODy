import {YearRange} from "../yearRange";
import {ResultType, ResultTypeWithArrays, ResultTypeWithMatrix} from "./results";


/**
 * @swagger
 * components:
 *   schemas:
 *     DemographicDataCountResponse:
 *       type: object
 *       properties:
 *         returned:
 *           type: integer
 *           description: The number of items returned
 *         yearRange:
 *           $ref: '#/components/schemas/YearRange'
 *           description: The range of years for the demographic data
 *         population:
 *           type: integer
 *           description: The population count
 *         groupedByValues:
 *           type: array
 *           items:
 *             oneOf:
 *               - type: string
 *               - type: integer
 *           description: Values by which the data is grouped
 *         result:
 *           oneOf:
 *             - $ref: '#/components/schemas/ResultType'
 *             - $ref: '#/components/schemas/ResultTypeWithArrays'
 *           description: The result data
 *
 *     DemographicDataPerYearResponse:
 *       type: object
 *       properties:
 *         returned:
 *           type: integer
 *           description: The number of items returned
 *         yearRange:
 *           $ref: '#/components/schemas/YearRange'
 *           description: The range of years for the demographic data
 *         population:
 *           type: array
 *           items:
 *             type: integer
 *           description: The population count per year
 *         groupedByValues:
 *           type: array
 *           items:
 *             oneOf:
 *               - type: string
 *               - type: integer
 *           description: Values by which the data is grouped
 *         result:
 *           oneOf:
 *             - $ref: '#/components/schemas/ResultTypeWithArrays'
 *             - $ref: '#/components/schemas/ResultTypeWithMatrix'
 *           description: The result data
 */

export interface DemographicDataCountResponse {
    returned: number;
    yearRange?: YearRange;
    population: number;
    groupedByValues?: (string | number)[];
    result: ResultType | ResultTypeWithArrays;
}

export interface DemographicDataPerYearResponse {
    returned: number;
    yearRange?: YearRange;
    population: number[];
    groupedByValues?: (string | number)[];
    result: ResultTypeWithArrays | ResultTypeWithMatrix;
}

export interface DemographicDataSingleResponse {
    yearRange?: YearRange;
    population: number;
}

export interface DemographicDataArrayResponse {
    yearRange?: YearRange;
    population: number[];
}

