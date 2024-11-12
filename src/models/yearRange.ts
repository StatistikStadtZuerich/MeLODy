/**
 * @swagger
 * components:
 *   schemas:
 *     YearRange:
 *       type: object
 *       properties:
 *         startYear:
 *           type: integer
 *         endYear:
 *           type: integer
 *         yearsIncluded:
 *           type: array
 *           items:
 *             type: integer
 */
export interface YearRange {
    startYear: number;
    endYear: number;
    yearsIncluded: number[];
}