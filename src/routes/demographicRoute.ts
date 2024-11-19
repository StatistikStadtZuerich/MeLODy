import {Request, Response, Router} from 'express';
import {DemographicData} from '../models/demographicData';
import {readCSV} from "../utils/csvUtils";
import {bodyToDemographicDataRequest, demographicDataFiltered} from "../utils/demographicDataUtils";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";

const sszDataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=b2abdef7-3e3f-4883-8033-6787a1561987&limit=1000000";
let data: DemographicData[] = [];
// sszDataFetcher<DemographicData>(sszDataUrl).then(result => {
//     console.log(`Downloaded ${result.length} demographic data from SSZ.`)
//     data = result;
// })

readCSV<DemographicData>('./src/data/bev390od3903.csv')
    .then(results => {
        console.log(`Parsed ${results.length} demographic data from CSV.`);
        data = results;
    })
    .catch(err => console.error(err));


const router = Router();

/**
 * @swagger
 * /demographics:
 *   post:
 *     summary: Retrieve demographic data with filtering and grouping
 *     operationId: getDemographicData
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DemographicDataRequestQueryFilter'
 *       200:
 *         description: Successfully retrieved and grouped demographic data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                   description: The grouped demographic data
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The keys used for grouping the data
 *                 total:
 *                   type: integer
 *                   description: The total number of records found
 *                 source:
 *                   type: string
 *                   description: The source of the data
 *       404:
 *         description: No data found for the specified parameters or no groupBy specified
 */
router.post('/', (req: Request, res: Response) => {
    const query = bodyToDemographicDataRequest(req)
    const filteredData = demographicDataFiltered(query, data)

    let subroutes = query.groupBy || [];
    if (!subroutes.includes('AnzBestWir')) {
        subroutes.push('AnzBestWir');
    }

    if (filteredData.length === 0) {
        res.status(404).json({message: 'No data found for the specified parameters'});
        return;
    } else if (subroutes.length === 0) {
        res.status(404).json({message: 'No subroutes specified'});
        return;
    }
    const groupedData = groupDataByQueryParamsCombined(filteredData, subroutes, {sum: true});
    res.status(200).json({...groupedData, source: sszDataUrl});
});


export default router;