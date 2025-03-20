import {IncomeData} from "../incomeData";

/**
 * @swagger
 * components:
 *   schemas:
 *     IncomeDataRequest:
 *       type: object
 *       properties:
 *         startYear:
 *           type: integer
 *           description: Start year for the income data
 *         endYear:
 *           type: integer
 *           description: End year for the income data
 *         year:
 *           type: integer
 *           description: Specific year for the income data
 *         district:
 *           type: string
 *           description: District/quarter name (Stadtquartier)
 *         householdType:
 *           type: string
 *           description: Type of household (Haushaltstyp)
 *         medianIncome:
 *           type: number
 *           description: Median equivalent household income in 1000 CHF
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - year
 *               - district
 *               - householdType
 *               - medianIncome
 *           description: Group by criteria
 */
export interface IncomeDataRequest {
    startYear?: number;
    endYear?: number;
    year?: number;
    district?: string;
    householdType?: string;
    medianIncome?: number;
    groupBy: (keyof IncomeData)[];
}