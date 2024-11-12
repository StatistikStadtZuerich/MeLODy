/**
 * @swagger
 * components:
 *   schemas:
 *     DemographicData:
 *       type: object
 *       properties:
 *         _id:
 *           type: integer
 *           description: Unique identifier for the demographic data record
 *           example: 100
 *         StichtagDatJahr:
 *           type: string
 *           description: Year of the record
 *           example: "1993"
 *         AlterVSort:
 *           type: string
 *           description: Sort order for age category
 *           example: "0"
 *         AlterVCd:
 *           type: string
 *           description: Age category code
 *           example: "0"
 *         AlterVKurz:
 *           type: string
 *           description: Short description of age category
 *           example: "0"
 *         AlterV05Sort:
 *           type: string
 *           description: Sort order for age category (5-year groups)
 *           example: "1"
 *         AlterV05Cd:
 *           type: string
 *           description: Age category code (5-year groups)
 *           example: "0"
 *         AlterV05Kurz:
 *           type: string
 *           description: Short description of age category (5-year groups)
 *           example: "0-4"
 *         AlterV10Cd:
 *           type: string
 *           description: Age category code (10-year groups)
 *           example: "0"
 *         AlterV10Kurz:
 *           type: string
 *           description: Short description of age category (10-year groups)
 *           example: "0-9"
 *         AlterV20Cd:
 *           type: string
 *           description: Age category code (20-year groups)
 *           example: "0"
 *         AlterV20Kurz:
 *           type: string
 *           description: Short description of age category (20-year groups)
 *           example: "0-19"
 *         SexCd:
 *           type: string
 *           description: Gender code
 *           example: "1"
 *         SexLang:
 *           type: string
 *           description: Full description of gender
 *           example: "männlich"
 *         SexKurz:
 *           type: string
 *           description: Short description of gender
 *           example: "M"
 *         KreisCd:
 *           type: string
 *           description: District code
 *           example: "7"
 *         KreisLang:
 *           type: string
 *           description: Full description of district
 *           example: "Kreis 7"
 *         QuarSort:
 *           type: string
 *           description: Sort order for neighborhood
 *           example: "71"
 *         QuarCd:
 *           type: string
 *           description: Neighborhood code
 *           example: "071"
 *         QuarLang:
 *           type: string
 *           description: Full description of neighborhood
 *           example: "Fluntern"
 *         HerkunftSort:
 *           type: string
 *           description: Sort order for origin
 *           example: "2"
 *         HerkunftCd:
 *           type: string
 *           description: Origin code
 *           example: "2"
 *         HerkunftLang:
 *           type: string
 *           description: Full description of origin
 *           example: "Ausländer*in"
 *         AnzBestWir:
 *           type: string
 *           description: Number of residents
 *           example: "12"
 */
export interface DemographicData {
    _id: number;
    StichtagDatJahr: string;
    AlterVSort: string;
    AlterVCd: string;
    AlterVKurz: string;
    AlterV05Sort: string;
    AlterV05Cd: string;
    AlterV05Kurz: string;
    AlterV10Cd: string;
    AlterV10Kurz: string;
    AlterV20Cd: string;
    AlterV20Kurz: string;
    SexCd: string;
    SexLang: string;
    SexKurz: string;
    KreisCd: string;
    KreisLang: string;
    QuarSort: string;
    QuarCd: string;
    QuarLang: string;
    HerkunftSort: string;
    HerkunftCd: string;
    HerkunftLang: string;
    AnzBestWir: string;
}
