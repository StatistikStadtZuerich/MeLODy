import {Router} from "express";
import {sszDataFetcher} from "../services/sszDataFetcher";
import {MietpreisData} from "../models/mietpreisData";
import {bodyToMietpreisRequest, filterMietpreisData} from "../utils/mietpreisDataUtils";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";

const dataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=1faf7e1b-0017-4a0a-8ffe-6077b4d597e4&limit=1000000"
let data: MietpreisData[] = []
sszDataFetcher<MietpreisData>(dataUrl).then(result => {
    console.log(
        `Downloaded ${result.length} mietpreis data from SSZ.`)
    data = result
})

const router = Router();

/**
 * @swagger
 * /mietpreise:
 *   post:
 *     summary: Fetch and filter Mietpreis data
 *     description: Fetches Mietpreis data based on the given filter criteria and optionally groups the data.
 *     operationId: fetchMietpreisData
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MietpreisDataRequest'
 *     responses:
 *       200:
 *         description: Successful response with Mietpreis data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Bad request.
 *       404:
 *         description: No data found for the specified parameters.
 */
router.post('/', async (req, res) => {
    try {
        const requestBody = bodyToMietpreisRequest(req)
        const filteredData = filterMietpreisData(data, requestBody)
        if (filteredData.length === 0) {
            res.status(404).json({error: 'No data found for the specified parameters'});
            return;
        } else if (requestBody.groupBy.length === 0) {
            res.status(200).json(filteredData);
            return;
        }
        res.status(200).json(groupDataByQueryParamsCombined(filteredData, requestBody.groupBy, {statisticalSummaries: true}))
    } catch (e) {
        console.error(e)
        res.status(400).json({error: e})
    }
})

export default router;