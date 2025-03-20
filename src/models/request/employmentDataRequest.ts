import {EmploymentData} from "../employmentData";

/**
 * @swagger
 * components:
 *   schemas:
 *     EmploymentDataRequest:
 *       type: object
 *       description: Filter options for employment data queries including time range parameters and grouping dimensions.
 *       properties:
 *         startDate:
 *           type: integer
 *           example: 2000
 *         endDate:
 *           type: integer
 *           example: 2020
 *         date:
 *           type: integer
 *           example: 2010
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - year
 *               - allEmployed
 *               - fullTime
 *           example: ["year", "fullTime"]
 */
export interface EmploymentDataRequest {
    startDate?: number;
    endDate?: number;
    date?: number;
    groupBy: (keyof EmploymentData)[];
}