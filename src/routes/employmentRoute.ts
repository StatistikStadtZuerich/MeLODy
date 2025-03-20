import {Router} from "express";
import {EmploymentData} from "../models/employmentData";
import {bodyToEmploymentData, filterEmploymentData} from "../utils/employmentDataUtils";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";
import queryMediator from "../services/QueryMediator";
import {parseCSVFromAPI} from "../utils/csvUtils";

const dataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=663a5181-c918-4af3-94e8-efb44bad3678&limit=1000"
let data: EmploymentData[] = []
// sszDataFetcher<EmploymentData>(dataUrl).then(result => {
//     console.log(
//         `Downloaded ${result.length} employment data from SSZ.`)
//     data = result;
// })

const query = `SELECT ?Datum_nach_Quartal ?Beschaeftigungsgrad ?Anzahl_Beschaeftigte WHERE {
  <https://ld.stadt-zuerich.ch/statistics/800022/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Quartal;
        sszP:TIME ?Datum_nach_Quartal;
        sszP:BEG/schema:name ?Beschaeftigungsgrad;
        sszM:BBS ?Anzahl_Beschaeftigte
  ]
} 
ORDER BY ?Datum_nach_Quartal ?Beschaeftigungsgrad`

queryMediator.executeSparqlQuery(query).then(async result => {
    if (result) {
        data = await parseCSVFromAPI<EmploymentData>(result);
    }
}).catch((error) => {
    console.error(error);
})
const router = Router()

/**
 * @swagger
 * /employment:
 *   post:
 *     summary: Filter and group employment data
 *     description: Filters the employment data based on various parameters and groups the data if specified.
 *     operationId: employmentData
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmploymentDataRequest'
 *     responses:
 *       200:
 *         description: Successful response with filtered (and possibly grouped) data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       404:
 *         description: No data found for the specified parameters.
 */
router.post('/', async (req, res) => {
    try {
        const request = bodyToEmploymentData(req);
        const filteredData = filterEmploymentData(data, request);
        if (filteredData.length === 0) {
            res.status(404).json({error: 'No data found for the specified parameters'});
            return;
        } else if (request.groupBy.length === 0) {
            res.status(200).json(filteredData);
            return;
        }
        let subroutes = request.groupBy || [];
        if (!subroutes.includes('Anzahl_Beschaeftigte') && !subroutes.includes('Beschaeftigungsgrad')) {
            subroutes.push('Anzahl_Beschaeftigte');
        }
        res.status(200).json({
            ...groupDataByQueryParamsCombined(filteredData, request.groupBy),
            source: dataUrl
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({error: e});
    }
});


export default router;