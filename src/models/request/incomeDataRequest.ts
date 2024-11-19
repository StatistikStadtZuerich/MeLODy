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
 *         quar:
 *           type: string
 *           description: Quarter for the income data
 *         tarif:
 *           type: string
 *           enum:
 *             - Grundtarif
 *             - Verheiratetentarif
 *             - Einelternfamilientarif
 *           description: Tax tariff
 *         taxIncome_p50:
 *           type: number
 *           description: Median income
 *         taxIncome_p25:
 *           type: number
 *           description: 25th percentile income
 *         taxIncome_p75:
 *           type: number
 *           description: 75th percentile income
 *         groupBy:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - year
 *               - quar
 *               - tarif
 *               - taxIncome_p50
 *               - taxIncome_p25
 *               - taxIncome_p75
 *           description: Group by criteria
 */
export interface IncomeDataRequest {
    startYear?: number;
    endYear?: number;
    year?: number;
    quar?: string;
    tarif?: 'Grundtarif' | 'Verheiratetentarif' | 'Einelternfamilientarif';
    taxIncome_p50?: number;
    taxIncome_p25?: number;
    taxIncome_p75?: number;
    groupBy: (keyof IncomeData)[];
}