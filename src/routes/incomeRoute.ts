import {Router} from "express";
import {sszDataFetcher} from "../services/sszDataFetcher";
import {IncomeData} from "../models/incomeData";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";
import {bodyToIncomeDataRequest, filterIncomeData} from "../utils/incomeDataUtils";

const sszDataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=af01ed91-04f8-445b-8dfc-04cbf0a27e95&limit=1000000";
let results: IncomeData[] = [];
sszDataFetcher<IncomeData>(sszDataUrl).then(result => {
    console.log(`Downloaded ${result.length} income data from SSZ.`)
    results = result
})
const router = Router();

/**
 * @swagger
 * /income:
 *   post:
 *     summary: Retrieve grouped income data based on filters and grouping parameters
 *     operationId: postIncomeData
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IncomeDataRequest'
 *     responses:
 *       200:
 *         description: A grouped set of income data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: string
 *                 result:
 *                   type: object
 *                 total:
 *                   type: integer
 *                 source:
 *                   type: string
 *                   description: The source of the data
 *       404:
 *         description: No data found for the specified parameters or no subroutes specified
 *       500:
 *         description: Internal Server Error
 */
router.post('/', async (req, res) => {
    try {
        const requestObject = bodyToIncomeDataRequest(req);
        const filteredData = filterIncomeData(results, requestObject);

        const subroutes = requestObject.groupBy || [];

        if (filteredData.length === 0) {
            res.status(404).json({message: 'No data found for the specified parameters'});
            return;
        }
        const groupedData = groupDataByQueryParamsCombined(filteredData, ['StichtagDatJahr', 'QuarLang', 'SteuerTarifLang', 'SteuerEinkommen_p50'], {statisticalSummaries: false});
        res.status(200).json({...groupedData, source: sszDataUrl});
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

export default router;