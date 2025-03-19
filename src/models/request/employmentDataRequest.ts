import {EmploymentData} from "../employmentData";

/**
 * @swagger
 * components:
 *   schemas:
 *     EmploymentDataRequest:
 *       type: object
 *       properties:
 *         startDate:
 *           type: integer
 *           description: The start year for filtering employment data.
 *           example: 2000
 *         endDate:
 *           type: integer
 *           description: The end year for filtering employment data.
 *           example: 2020
 *         date:
 *           type: integer
 *           description: The specific year for filtering employment data.
 *           example: 2010
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - year
 *               - allEmployed
 *               - fullTime
 *           description: List of keys to group the data by.
 *           example: ["year", "fullTime"]
 */
export interface EmploymentDataRequest {
    startDate?: number;
    endDate?: number;
    date?: number;
    groupBy: (keyof EmploymentData)[];
}