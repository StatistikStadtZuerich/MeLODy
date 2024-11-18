import {Router} from "express";
import {sszDataFetcher} from "../services/sszDataFetcher";
import {IncomeData} from "../models/incomeData";
import {applyPagination, dataResponse} from "../utils/routeUtils";
import {groupDataByQueryParamsCombined, sortData} from "../utils/dataUtils";
import {bodyToIncomeDataRequest, filterIncomeData} from "../utils/incomeDataUtils";

const sszDataUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=af01ed91-04f8-445b-8dfc-04cbf0a27e95&limit=1000000";
let results: IncomeData[] = [];
sszDataFetcher<IncomeData>(sszDataUrl).then(result => {
    console.log(`Downloaded ${result.length} income data from SSZ.`)
    results = result
})
const router = Router();

/**
 // * @swagger
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
        const {
            startYear,
            endYear,
            year,
            district,
            taxCategory,
            minMedianIncome,
            maxMedianIncome,
            minIncomeP25,
            maxIncomeP75,
            sortBy,
            sortAsc,
        } = req.query;

        let filteredResults = results

        if (startYear || endYear) {
            filteredResults = filteredResults.filter(entry => {
                const entryYear = parseInt(entry.StichtagDatJahr, 10);
                if (startYear && endYear) {
                    return entryYear >= parseInt(String(startYear), 10) && entryYear <= parseInt(String(endYear), 10);
                } else if (startYear) {
                    return entryYear >= parseInt(String(startYear), 10);
                } else if (endYear) {
                    return entryYear <= parseInt(String(endYear), 10);
                }
                return true;
            });
        }

        if (year) {
            filteredResults = filteredResults.filter(entry => entry.StichtagDatJahr === String(year));
        }

        if (district) {
            filteredResults = filteredResults.filter(entry => entry.QuarLang.toLowerCase() === String(district).toLowerCase());
        }

        if (taxCategory) {
            filteredResults = filteredResults.filter(entry => entry.SteuerTarifLang.toLowerCase() === String(taxCategory).toLowerCase());
        }

        if (minMedianIncome) {
            filteredResults = filteredResults.filter(entry => entry.SteuerEinkommen_p50 >= parseFloat(String(minMedianIncome)));
        }
        if (maxMedianIncome) {
            filteredResults = filteredResults.filter(entry => entry.SteuerEinkommen_p50 <= parseFloat(String(maxMedianIncome)));
        }

        if (minIncomeP25) {
            filteredResults = filteredResults.filter(entry => entry.SteuerEinkommen_p25 >= parseFloat(String(minIncomeP25)));
        }
        if (maxIncomeP75) {
            filteredResults = filteredResults.filter(entry => entry.SteuerEinkommen_p75 <= parseFloat(String(maxIncomeP75)));
        }

        sortData(filteredResults, sortBy?.toString(), sortAsc === 'true')
        const paginatedResults = applyPagination(req, filteredResults);

        if (paginatedResults.length > 0) {
            dataResponse(res, paginatedResults, results.length);
        } else {
            res.status(404).json({error: 'No data found for the specified parameters'});
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({error: 'Internal Server Error'});
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
 *                 source:
 *                   type: string
 *                   description: The source of the data
 *       404:
 *         description: No data found for the specified parameters or no subroutes specified
 *       500:
 *         description: Internal Server Error
 */
router.post('/', async (req, res) => {
    try {
        const requestObject = bodyToIncomeDataRequest(req);
        const filteredData = filterIncomeData(results, requestObject);

        const subroutes = requestObject.groupBy || [];

        if (filteredData.length === 0) {
            res.status(404).json({message: 'No data found for the specified parameters'});
            return;
        } else if (subroutes.length === 0) {
            res.status(404).json({message: 'No subroutes specified'});
            return;
        }
        const groupedData = groupDataByQueryParamsCombined(filteredData, subroutes, {statisticalSummaries: true});
        res.status(200).json({...groupedData, source: sszDataUrl});
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

export default router;