"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sszDataFetcher_1 = require("../services/sszDataFetcher");
const routeUtils_1 = require("../utils/routeUtils");
const kMeansDataExtraction_1 = __importDefault(require("../utils/kMeansDataExtraction"));
const dataUtils_1 = require("../utils/dataUtils");
const incomeDataUtils_1 = require("../utils/incomeDataUtils");
const sszDataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=af01ed91-04f8-445b-8dfc-04cbf0a27e95&limit=1000000";
let results = [];
(0, sszDataFetcher_1.sszDataFetcher)(sszDataUrl).then(result => {
    console.log(`Downloaded ${result.length} income data from SSZ.`);
    results = result;
});
const router = (0, express_1.Router)();
/**
 * @swagger
 * /income:
 *   get:
 *     summary: Retrieve income data with filtering
 *     operationId: getIncomeData
 *     parameters:
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: string
 *         description: Start year for the timeframe filter
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: string
 *         description: End year for the timeframe filter
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filter by specific year
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district name
 *       - in: query
 *         name: taxCategory
 *         schema:
 *           type: string
 *         description: Filter by tax category
 *       - in: query
 *         name: minMedianIncome
 *         schema:
 *           type: number
 *         description: Filter by minimum median income
 *       - in: query
 *         name: maxMedianIncome
 *         schema:
 *           type: number
 *         description: Filter by maximum median income
 *       - in: query
 *         name: minIncomeP25
 *         schema:
 *           type: number
 *         description: Filter by minimum income at 25th percentile
 *       - in: query
 *         name: maxIncomeP75
 *         schema:
 *           type: number
 *         description: Filter by maximum income at 75th percentile
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
 *           enum: [StichtagDatJahr, QuarSort, QuarCd, SteuerTarifSort, SteuerTarifCd, SteuerEinkommen_p50, SteuerEinkommen_p25, SteuerEinkommen_p75]
 *         description: The field to sort by
 *       - in: query
 *         name: sortAsc
 *         schema:
 *           type: boolean
 *         description: Whether to sort in ascending order (true) or descending order (false)
 *       - in: query
 *         name: reduce
 *         schema:
 *           type: boolean
 *         description: Reduce a large dataset into a smaller one with the same date range
 *     responses:
 *       200:
 *         description: A list of income data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 returned:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IncomeData'
 *       404:
 *         description: No data found for the specified parameters
 *       500:
 *         description: Internal Server Error
 */
router.get('/', async (req, res) => {
    try {
        const { startYear, endYear, year, district, taxCategory, minMedianIncome, maxMedianIncome, minIncomeP25, maxIncomeP75, sortBy, sortAsc, reduce } = req.query;
        const { limit, offset } = (0, routeUtils_1.extractLimitAndOffset)(req);
        if (startYear || endYear) {
            results = results.filter(entry => {
                const entryYear = parseInt(entry.StichtagDatJahr, 10);
                if (startYear && endYear) {
                    return entryYear >= parseInt(String(startYear), 10) && entryYear <= parseInt(String(endYear), 10);
                }
                else if (startYear) {
                    return entryYear >= parseInt(String(startYear), 10);
                }
                else if (endYear) {
                    return entryYear <= parseInt(String(endYear), 10);
                }
                return true;
            });
        }
        if (year) {
            results = results.filter(entry => entry.StichtagDatJahr === String(year));
        }
        if (district) {
            results = results.filter(entry => entry.QuarLang.toLowerCase() === String(district).toLowerCase());
        }
        if (taxCategory) {
            results = results.filter(entry => entry.SteuerTarifLang.toLowerCase() === String(taxCategory).toLowerCase());
        }
        if (minMedianIncome) {
            results = results.filter(entry => entry.SteuerEinkommen_p50 >= parseFloat(String(minMedianIncome)));
        }
        if (maxMedianIncome) {
            results = results.filter(entry => entry.SteuerEinkommen_p50 <= parseFloat(String(maxMedianIncome)));
        }
        if (minIncomeP25) {
            results = results.filter(entry => entry.SteuerEinkommen_p25 >= parseFloat(String(minIncomeP25)));
        }
        if (maxIncomeP75) {
            results = results.filter(entry => entry.SteuerEinkommen_p75 <= parseFloat(String(maxIncomeP75)));
        }
        if (reduce) {
            const key = district ? "QuarLang" : "SteuerTarifLang";
            const value = (district ? district : taxCategory) || results[0].SteuerTarifLang;
            results = (0, kMeansDataExtraction_1.default)(results, limit || 2000, key, String(value));
        }
        // else if (reduce === 'fps') {
        //     results = farthestPointSampling(results, limit || 1000, "SteuerTarifLang", results[0].SteuerTarifLang);
        // }
        (0, dataUtils_1.sortData)(results, sortBy?.toString(), sortAsc === 'true');
        // if (sortBy && typeof sortBy === 'string') {
        //     const isAscending = sortAsc === 'true';
        //     const sortKey = sortBy as keyof IncomeData;
        //
        //     results.sort((a: IncomeData, b: IncomeData) => {
        //         const aValue: string | number = a[sortKey];
        //         const bValue: string | number = b[sortKey];
        //         if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        //             return isAscending ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
        //         } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        //             return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        //         }
        //         return 0
        //     });
        // }
        const paginatedResults = (0, routeUtils_1.applyPagination)(req, results);
        if (paginatedResults.length > 0) {
            (0, routeUtils_1.dataResponse)(res, paginatedResults, results.length);
        }
        else {
            res.status(404).json({ error: 'No data found for the specified parameters' });
        }
    }
    catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
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
 *       404:
 *         description: No data found for the specified parameters or no subroutes specified
 *       500:
 *         description: Internal Server Error
 */
router.post('/', async (req, res) => {
    try {
        const requestObject = (0, incomeDataUtils_1.bodyToIncomeDataRequest)(req);
        const filteredData = (0, incomeDataUtils_1.filterIncomeData)(results, requestObject);
        const subroutes = requestObject.groupBy || [];
        if (filteredData.length === 0) {
            res.status(404).json({ message: 'No data found for the specified parameters' });
            return;
        }
        else if (subroutes.length === 0) {
            res.status(404).json({ message: 'No subroutes specified' });
            return;
        }
        const groupedData = (0, dataUtils_1.groupDataByQueryParamsWithValues)(filteredData, subroutes);
        res.json(groupedData);
    }
    catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
