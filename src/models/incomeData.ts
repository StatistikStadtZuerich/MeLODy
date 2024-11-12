/**
 * @swagger
 * components:
 *   schemas:
 *     IncomeData:
 *       type: object
 *       properties:
 *         _id:
 *           type: integer
 *           description: Unique identifier
 *         StichtagDatJahr:
 *           type: string
 *           description: Reference year
 *         QuarSort:
 *           type: string
 *           description: Sort order of the quarter
 *         QuarCd:
 *           type: string
 *           description: Quarter code
 *         QuarLang:
 *           type: string
 *           description: Full name of the quarter
 *         SteuerTarifSort:
 *           type: string
 *           description: Tax tariff sort order
 *         SteuerTarifCd:
 *           type: string
 *           description: Tax tariff code
 *         SteuerTarifLang:
 *           type: string
 *           description: Full name of the tax tariff
 *         SteuerEinkommen_p50:
 *           type: number
 *           description: Median income
 *         SteuerEinkommen_p25:
 *           type: number
 *           description: 25th percentile income
 *         SteuerEinkommen_p75:
 *           type: number
 *           description: 75th percentile income
 */
export interface IncomeData {
    _id: number;
    StichtagDatJahr: string;
    QuarSort: string;
    QuarCd: string;
    QuarLang: string;
    SteuerTarifSort: string;
    SteuerTarifCd: string;
    SteuerTarifLang: string;
    SteuerEinkommen_p50: number;
    SteuerEinkommen_p25: number;
    SteuerEinkommen_p75: number;
}