import {PopulationData} from "../models/populationData";
import {Router} from "express";
import {sszDataFetcher} from "../services/sszDataFetcher";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";

const populationQueryUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=9bacf5c9-a8c0-416d-a162-3b5f0a2d300d&limit=1000";
let results: PopulationData[] = [];
sszDataFetcher<PopulationData>(populationQueryUrl).then(result => {
    console.log(`Downloaded ${result.length} population data from SSZ.`)
    results = result
})
const router = Router();

/**
 * @swagger
 * /population:
 *   get:
 *     summary: Retrieve population data
 *     description: Retrieve population data based on various filters such as year, startYear, endYear, minPopulation, maxPopulation.
 *     operationId: getPopulationNumbers
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filter by specific year
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: string
 *         description: Filter by start year
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: string
 *         description: Filter by end year
 *       - in: query
 *         name: minPopulation
 *         schema:
 *           type: integer
 *         description: Filter by minimum population
 *       - in: query
 *         name: maxPopulation
 *         schema:
 *           type: integer
 *         description: Filter by maximum population
 *     responses:
 *       200:
 *         description: A list of population data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: The total number of population records
 *                 returned:
 *                   type: integer
 *                   description: The number of population records returned
 *                 source:
 *                   type: string
 *                   description: The source of the population data
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PopulationData'
 *       404:
 *         description: No data found for the specified parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No data found for the specified parameters
 */
router.get('/', async (req, res) => {
    const {year, startYear, endYear, minPopulation, maxPopulation, offset, limit, sortBy, sortAsc} = req.query;
    if (results.length === 0) {
        res.status(404).json({error: 'No data found for the specified parameters'});
        return;
    }

    let filteredResults = results;

    if (year) {
        filteredResults = filteredResults.filter(entry => entry.StichtagDatJahr === String(year));
    }

    if (startYear) {
        filteredResults = filteredResults.filter(entry => parseInt(entry.StichtagDatJahr) >= parseInt(String(startYear)));
    }
    if (endYear) {
        filteredResults = filteredResults.filter(entry => parseInt(entry.StichtagDatJahr) <= parseInt(String(endYear)));
    }

    if (minPopulation) {
        filteredResults = filteredResults.filter(entry => entry.AnzBestWir >= parseInt(String(minPopulation)));
    }
    if (maxPopulation) {
        filteredResults = filteredResults.filter(entry => entry.AnzBestWir <= parseInt(String(maxPopulation)));
    }


    if (filteredResults.length > 0) {
        const resValues = groupDataByQueryParamsCombined(filteredResults, ['StichtagDatJahr', 'AnzBestWir'], {sum: true})
        res.status(200).json({...resValues, source: populationQueryUrl})
    } else {
        res.status(404).json({error: 'No data found for the specified parameters'});
    }
});

export default router;