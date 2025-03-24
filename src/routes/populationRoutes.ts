import {PopulationData} from "../models/populationData";
import {Router} from "express";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";
import queryMediator from "../services/QueryMediator";
import {parseCSVFromAPI} from "../utils/csvUtils";

const populationQueryUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=9bacf5c9-a8c0-416d-a162-3b5f0a2d300d&limit=1000";
let results: PopulationData[] = [];
// sszDataFetcher<PopulationData>(populationQueryUrl).then(result => {
//     console.log(`Downloaded ${result.length} population data from SSZ.`)
//     results = result
// })

const query = `SELECT (year(?Datum) AS ?Jahr) ?Wirtschaftliche_Wohnbevoelkerung WHERE {
  <https://ld.stadt-zuerich.ch/statistics/000201/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:TIME ?Datum;
        sszM:BEW ?Wirtschaftliche_Wohnbevoelkerung;
        sszP:RAUM <https://ld.stadt-zuerich.ch/statistics/code/R30000>
  ]
} 
ORDER BY ?Jahr`;
queryMediator.executeSparqlQuery(query).then(async result => {
    if (result) {
        results = await parseCSVFromAPI<PopulationData>(result);
    }
}).catch((error) => {
    console.error(error);
})
const router = Router();

/**
 * @swagger
 * /population:
 *   get:
 *     summary: Retrieve population data
 *     description: Retrieve overall population numbers with optional filtering by year range (year, startYear, endYear) and population range (minPopulation, maxPopulation).
 *     operationId: getPopulationNumbers
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: string
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPopulation
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxPopulation
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of population data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       404:
 *         description: No data found for the specified parameters
 */
router.get('/', async (req, res) => {
    const {year, startYear, endYear, minPopulation, maxPopulation, offset, limit, sortBy, sortAsc} = req.query;
    if (results.length === 0) {
        res.status(404).json({error: 'No data found for the specified parameters'});
        return;
    }

    let filteredResults = results;

    if (year) {
        filteredResults = filteredResults.filter(entry => entry.Jahr === String(year));
    }

    if (startYear) {
        filteredResults = filteredResults.filter(entry => parseInt(entry.Jahr) >= parseInt(String(startYear)));
    }
    if (endYear) {
        filteredResults = filteredResults.filter(entry => parseInt(entry.Jahr) <= parseInt(String(endYear)));
    }

    if (minPopulation) {
        filteredResults = filteredResults.filter(entry => entry.Wirtschaftliche_Wohnbevoelkerung >= parseInt(String(minPopulation)));
    }
    if (maxPopulation) {
        filteredResults = filteredResults.filter(entry => entry.Wirtschaftliche_Wohnbevoelkerung <= parseInt(String(maxPopulation)));
    }


    if (filteredResults.length > 0) {
        const resValues = groupDataByQueryParamsCombined(filteredResults, ['Jahr', 'Wirtschaftliche_Wohnbevoelkerung'], {sum: true})
        res.status(200).json({...resValues, source: populationQueryUrl})
    } else {
        res.status(404).json({error: 'No data found for the specified parameters'});
    }
});

export default router;