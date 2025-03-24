import {Router} from "express";
import {IncomeData} from "../models/incomeData";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";
import {bodyToIncomeDataRequest, filterIncomeData} from "../utils/incomeDataUtils";
import queryMediator from "../services/QueryMediator";
import {parseCSVFromAPI} from "../utils/csvUtils";

const sszDataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=af01ed91-04f8-445b-8dfc-04cbf0a27e95&limit=1000000";
let results: IncomeData[] = [];
// sszDataFetcher<IncomeData>(sszDataUrl).then(result => {
//     console.log(`Downloaded ${result.length} income data from SSZ.`)
//     results = result
// })

const query = `SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Haushaltstyp ?Haushaltsäquivalenzeinkommen_Median_in_1000_CHF WHERE {
    <https://ld.stadt-zuerich.ch/statistics/000608/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:RAUM/schema:inDefinedTermSet sszTS:QuartiereZH;
        sszP:RAUM/schema:name ?Stadtquartier;
        sszP:TIME ?Datum;
        sszP:HTY/schema:name ?Haushaltstyp;
        sszM:HAE ?Haushaltsäquivalenzeinkommen_Median_in_1000_CHF
    ]
    FILTER(regex(str(?Datum),".*-12-31","i")) # TODO should be removed when fix is done
} ORDER BY ?Datum_nach_Jahr ?Stadtquartier ?Haushaltstyp`;

queryMediator.executeSparqlQuery(query).then(async result => {
    if (result) {
        results = await parseCSVFromAPI<IncomeData>(result);
    }
}).catch((error) => {
    console.error(error);
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
 *               $ref: '#/components/schemas/DataResponse'
 *       404:
 *         description: No data found for the specified parameters or no subroutes specified
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
        const groupedData = groupDataByQueryParamsCombined(filteredData, requestObject.groupBy, {statisticalSummaries: false});
        res.status(200).json({...groupedData, source: sszDataUrl});
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

export default router;