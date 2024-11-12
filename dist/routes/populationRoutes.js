"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sszDataFetcher_1 = require("../services/sszDataFetcher");
const routeUtils_1 = require("../utils/routeUtils");
const dataUtils_1 = require("../utils/dataUtils");
const populationQueryUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=9bacf5c9-a8c0-416d-a162-3b5f0a2d300d&limit=1000";
let results = [];
(0, sszDataFetcher_1.sszDataFetcher)(populationQueryUrl).then(result => {
    console.log(`Downloaded ${result.length} population data from SSZ.`);
    results = result;
});
const router = (0, express_1.Router)();
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
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: The number of items to skip before starting to collect the result set
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items to return
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [year, population]
 *         description: The field to sort by
 *       - in: query
 *         name: sortAsc
 *         schema:
 *           type: boolean
 *         description: Whether to sort in ascending order (true) or descending order (false)
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
    const { year, startYear, endYear, minPopulation, maxPopulation, offset, limit, sortBy, sortAsc } = req.query;
    if (results.length === 0) {
        res.status(404).json({ error: 'No data found for the specified parameters' });
        return;
    }
    if (year) {
        results = results.filter(entry => entry.StichtagDatJahr === String(year));
    }
    if (startYear) {
        results = results.filter(entry => parseInt(entry.StichtagDatJahr) >= parseInt(String(startYear)));
    }
    if (endYear) {
        results = results.filter(entry => parseInt(entry.StichtagDatJahr) <= parseInt(String(endYear)));
    }
    if (minPopulation) {
        results = results.filter(entry => entry.AnzBestWir >= parseInt(String(minPopulation)));
    }
    if (maxPopulation) {
        results = results.filter(entry => entry.AnzBestWir <= parseInt(String(maxPopulation)));
    }
    (0, dataUtils_1.sortData)(results, sortBy?.toString(), sortAsc === 'true');
    // if (sortBy) {
    //     const isAscending = sortAsc === 'true'; // Convert to boolean
    //     switch (sortBy) {
    //         case 'year':
    //             results.sort((a, b) => {
    //                 const yearA = parseInt(a.StichtagDatJahr);
    //                 const yearB = parseInt(b.StichtagDatJahr);
    //                 return isAscending ? yearA - yearB : yearB - yearA;
    //             });
    //             break;
    //         case 'population':
    //             results.sort((a, b) => isAscending ? a.AnzBestWir - b.AnzBestWir : b.AnzBestWir - a.AnzBestWir);
    //             break;
    //     }
    // }
    const paginatedResults = (0, routeUtils_1.applyPagination)(req, results);
    if (paginatedResults.length > 0) {
        (0, routeUtils_1.dataResponse)(res, paginatedResults, results.length);
    }
    else {
        res.status(404).json({ error: 'No data found for the specified parameters' });
    }
});
exports.default = router;
