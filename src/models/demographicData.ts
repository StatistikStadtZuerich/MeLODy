/**
 // * @swagger
 * components:
 *   schemas:
 *     DemographicData:
 *       type: object
 *       properties:
 *         _id:
 *           type: integer
 *           description: Unique identifier for the demographic data record
 *           example: 100
 *         Datum_nach_Jahr:
 *           type: string
 *           description: Year extracted from the date
 *           example: "2023"
 *         Stadtquartier:
 *           type: string
 *           description: Name of the city quarter
 *           example: "Fluntern"
 *         Alter:
 *           type: string
 *           description: Age category
 *           example: "20-24"
 *         Heimatland:
 *           type: string
 *           description: Country of origin
 *           example: "Schweiz"
 *         Geschlecht:
 *           type: string
 *           description: Gender
 *           example: "männlich"
 *         Wirtschaftliche_Wohnbevoelkerung:
 *           type: string
 *           description: Economic residential population count
 *           example: "342"
 */
export interface DemographicData {
    _id: number;
    Datum_nach_Jahr: string;
    Stadtquartier: string;
    Alter: string;
    Heimatland: string;
    Geschlecht: string;
    Wirtschaftliche_Wohnbevoelkerung: string;
}