/**
 * @swagger
 * components:
 *   schemas:
 *     PopulationData:
 *       type: object
 *       properties:
 *         _id:
 *           type: integer
 *           description: The unique identifier for the population data
 *         StichtagDatJahr:
 *           type: string
 *           description: The year of the population data
 *         AnzBestWir:
 *           type: integer
 *           description: The number of people
 *       required:
 *         - _id
 *         - StichtagDatJahr
 *         - AnzBestWir
 */
export interface PopulationData {
    _id: number;
    StichtagDatJahr: string;
    AnzBestWir: number;
}