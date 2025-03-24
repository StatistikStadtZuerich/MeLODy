/**
 // * @swagger
 * components:
 *   schemas:
 *     PopulationData:
 *       type: object
 *       properties:
 *         Jahr:
 *           type: string
 *           description: The year of the population data
 *         Wirtschaftliche_Wohnbevoelkerung:
 *           type: integer
 *           description: The number of people
 *       required:
 *         - Jahr
 *         - Wirtschaftliche_Wohnbevoelkerung
 */
export interface PopulationData {
    Jahr: string;
    Wirtschaftliche_Wohnbevoelkerung: number;
}