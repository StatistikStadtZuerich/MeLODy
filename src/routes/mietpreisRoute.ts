import {Router} from "express";
import {MietpreisData} from "../models/mietpreisData";
import {bodyToMietpreisRequest, filterMietpreisData} from "../utils/mietpreisDataUtils";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";
import {sszDataFetcher} from "../services/sszDataFetcher";

const dataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=1faf7e1b-0017-4a0a-8ffe-6077b4d597e4&limit=1000000"
let data: MietpreisData[] = []
sszDataFetcher<MietpreisData>(dataUrl).then(result => {
    console.log(
        `Downloaded ${result.length} mietpreis data from SSZ.`)
    data = result
})


// queryMediator.executeSparqlQuery("").then(async result => {
//     console.log(result)
//     if (result) {
//         data = await parseCSVFromAPI<MietpreisData>(result);
//     }
// }).catch((error) => {
//     console.error(error);
// })
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
 *               type: object
 *               properties:
 *                 keys:
 *                   type: array
 *                   description: Array of keys by which the data was grouped.
 *                   items:
 *                     type: string
 *                 total:
 *                   type: number
 *                   description: Total number of grouped data items.
 *                 result:
 *                   type: object
 *                   description: The grouped data result.
 *                 source:
 *                   type: string
 *                   description: Source URL of the original data.
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
        }
        const groupedData = groupDataByQueryParamsCombined(filteredData, ['StichtagDatJahr', 'RaumeinheitLang', 'ZimmerLang', 'GemeinnuetzigLang', 'EinheitLang', 'PreisartLang', 'qu25', 'mean', 'qu75'], {statisticalSummaries: false})
        res.status(200).json({
            ...groupedData,
            source: dataUrl
        })
    } catch (e) {
        console.error(e)
        res.status(400).json({error: e})
    }
})

export default router;