/**
 // * @swagger
 * components:
 *   schemas:
 *     IncomeData:
 *       type: object
 *       properties:
 *         Datum_nach_Jahr:
 *           type: string
 *           description: Year extracted from the date
 *         Stadtquartier:
 *           type: string
 *           description: Name of the district/quarter
 *         Haushaltstyp:
 *           type: string
 *           description: Type of household
 *         Haushaltsäquivalenzeinkommen_Median_in_1000_CHF:
 *           type: number
 *           description: Median equivalent household income in 1000 CHF
 */
export interface IncomeData {
    Datum_nach_Jahr: string;
    Stadtquartier: string;
    Haushaltstyp: string;
    Haushaltsäquivalenzeinkommen_Median_in_1000_CHF: number;
}