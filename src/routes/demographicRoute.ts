import {Request, Response, Router} from 'express';
import {DemographicData} from '../models/demographicData';
import {bodyToDemographicDataRequest, demographicDataFiltered} from "../utils/demographicDataUtils";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";

const sszDataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=b2abdef7-3e3f-4883-8033-6787a1561987&limit=1000000";
let data: DemographicData[] = [];
// sszDataFetcher<DemographicData>(sszDataUrl).then(result => {
//     console.log(`Downloaded ${result.length} demographic data from SSZ.`)
//     data = result;
// })

// readCSV<DemographicData>('./src/data/bev390od3903.csv')
//     .then(results => {
//         console.log(`Parsed ${results.length} demographic data from CSV.`);
//         data = results;
//     })
//     .catch(err => console.error(err));

const query = `SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Alter ?Heimatland ?Geschlecht ?Wirtschaftliche_Wohnbevoelkerung WHERE {
    <https://ld.stadt-zuerich.ch/statistics/000238/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:RAUM/schema:inDefinedTermSet sszTS:QuartiereZH;
        sszP:RAUM/schema:name ?Stadtquartier;
        sszP:TIME ?Datum;
        sszP:ALT/schema:name ?Alter;
        sszP:HEL/schema:name ?Heimatland;
        sszP:SEX/schema:name ?Geschlecht;
        sszM:BEW ?Wirtschaftliche_Wohnbevoelkerung
    ]
    FILTER(regex(str(?Datum),".*-12-31","i")) # TODO should be removed when fix is done
} ORDER BY ?Datum_nach_Jahr ?Stadtquartier ?Alter ?Heimatland ?Geschlecht`;

// queryMediator.executeSparqlQuery(query).then(async result => {
//     if (result) {
//         data = await parseCSVFromAPI<DemographicData>(result);
//     }
// }).catch((error) => {
//     console.error(error);
// })
const router = Router();

/**
 // * @swagger
 * /demographics:
 *   post:
 *     summary: Retrieve demographic data for gender, nationality, quarter, age and more.
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
 *               $ref: '#/components/schemas/DataResponse'
 *       404:
 *         description: No data found for the specified parameters or no groupBy specified
 */
router.post('/', (req: Request, res: Response) => {
    const query = bodyToDemographicDataRequest(req)
    const filteredData = demographicDataFiltered(query, data)

    let groupByFields = query.groupBy || [];

    if (!groupByFields.includes('Wirtschaftliche_Wohnbevoelkerung')) {
        groupByFields.push('Wirtschaftliche_Wohnbevoelkerung');
    }

    if (filteredData.length === 0) {
        res.status(404).json({message: 'No data found for the specified parameters'});
        return;
    } else if (groupByFields.length === 0) {
        res.status(404).json({message: 'No grouping fields specified'});
        return;
    }

    const groupedData = groupDataByQueryParamsCombined(filteredData, groupByFields, {sum: true});
    res.status(200).json({...groupedData, source: sszDataUrl});
});


export default router;