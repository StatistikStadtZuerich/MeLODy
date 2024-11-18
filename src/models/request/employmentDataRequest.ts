/**
 * @swagger
 * components:
 *   schemas:
 *     EmploymentDataRequest:
 *       type: object
 *       properties:
 *         startYear:
 *           type: integer
 *           description: The start year for filtering employment data.
 *           example: 2000
 *         endYear:
 *           type: integer
 *           description: The end year for filtering employment data.
 *           example: 2020
 *         year:
 *           type: integer
 *           description: The specific year for filtering employment data.
 *           example: 2010
 *         startQuartal:
 *           type: integer
 *           description: The start quarter for filtering employment data.
 *           example: 1
 *           minimum: 1
 *           maximum: 4
 *         endQuartal:
 *           type: integer
 *           description: The end quarter for filtering employment data.
 *           example: 4
 *           minimum: 1
 *           maximum: 4
 *         quartal:
 *           type: integer
 *           description: The specific quarter for filtering employment data.
 *           example: 2
 *           minimum: 1
 *           maximum: 4
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - year
 *               - quarter
 *               - allEmployed
 *               - fullTime
 *           description: List of keys to group the data by.
 *           example: ["year", "quarter"]
 */
export interface EmploymentDataRequest {
    startYear?: number;
    endYear?: number;
    year?: number;
    startQuartal?: number;
    endQuartal?: number;
    quartal?: number;
    groupBy: string[];
}