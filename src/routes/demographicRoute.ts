import {Request, Response, Router} from 'express';
import {DemographicData} from '../models/demographicData';
import {readCSV} from "../utils/csvUtils";
import {
    aggregateDemographicData,
    bodyToDemographicDataRequest,
    demographicDataFiltered,
    demographicKeyMap,
    mapQueryToDemographicDataRequest,
    reqToDemographicData
} from "../utils/demographicDataUtils";
import {groupDataByQueryParamsCombined, queryToSimpleSelectionCriteria} from "../utils/dataUtils";
import {DemographicDataArrayResponse, DemographicDataSingleResponse} from "../models/response/DemographicDataResponse";

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

// /**
//  * @swagger
//  * /demographics:
//  *   post:
//  *     summary: Retrieve demographic data with filtering
//  *     operationId: getDemographicData
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               demographicDataRequest:
//  *                 $ref: '#/components/schemas/DemographicDataRequest'
//  *               selectionCriteria:
//  *                 $ref: '#/components/schemas/SelectionCriteria'
//  *     responses:
//  *       200:
//  *         description: Retrieves a list of demographic data.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 total:
//  *                   type: integer
//  *                   description: The total number of records found.
//  *                 data:
//  *                   type: array
//  *                   description: An array of demographic data.
//  *                   items:
//  *                     $ref: '#/components/schemas/DemographicData'
//  *                 returned:
//  *                   type: integer
//  *                   description: The number of records returned in the current response.
//  *       404:
//  *         description: No data found for the specified parameters
//  *       400:
//  *         description: At least one filter parameter is required
//  */
// router.post('/', async (req: Request, res: Response) => {
//     try {
//
//         const filteredData = demographicDataFiltered(mapQueryToDemographicDataRequest(req), data)
//
//         const selectionCriteria = bodyToSelectionCriteria<DemographicData>(req.body)
//         sortData(filteredData, selectionCriteria.sortBy || 'StichtagDatJahr', selectionCriteria.sortAsc);
//
//         const total = filteredData.length;
//         const paginatedData = applyPagination(req, filteredData);
//
//         if (total === 0) {
//             res.status(404).json({message: 'No data found for the specified parameters'});
//             return
//         }
//
//         dataResponse(res, paginatedData, total)
//     } catch (error) {
//         res.status(500).json({error});
//     }
// });


// /**
//  * @swagger
//  * /demographics/aggregate/count:
//  *   post:
//  *     summary: Aggregate demographic data counts
//  *     description: Aggregate demographic data counts based on the provided filters
//  *     operationId: aggregateCount
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               demographicDataRequest:
//  *                 $ref: '#/components/schemas/DemographicDataRequest'
//  *               selectionCriteria:
//  *                 $ref: '#/components/schemas/SimpleSelectionCriteria'
//  *     responses:
//  *       200:
//  *         description: Aggregation result
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/DemographicDataCountResponse'
//  *       404:
//  *         description: No data found for the specified parameters
//  *       500:
//  *         description: Internal server error
//  */
router.post('/aggregate/count', async (req: Request, res: Response) => {
    await reqToDemographicData(req, res, data, false);
});


router.get('/aggregate/count', async (req: Request, res: Response) => {
    try {
        const selectionCriteria = queryToSimpleSelectionCriteria(req)
        const result = await aggregateDemographicData(mapQueryToDemographicDataRequest(req), selectionCriteria, data, false)
        if (!result) {
            res.status(404).json({message: 'No data found for the specified parameters'});
            return
        }
        const singleResponse: DemographicDataSingleResponse = {
            yearRange: result.yearRange,
            population: result.population as number
        }
        res.status(200).json(singleResponse);
    } catch (error) {
        res.status(500).json({error});
    }
})


router.get('/aggregate/countPerYear', async (req: Request, res: Response) => {
    try {
        const selectionCriteria = queryToSimpleSelectionCriteria(req)
        const result = await aggregateDemographicData(mapQueryToDemographicDataRequest(req), selectionCriteria, data, true)
        if (!result) {
            res.status(404).json({message: 'No data found for the specified parameters'});
            return
        }
        const arrayResponse: DemographicDataArrayResponse = {
            yearRange: result.yearRange,
            population: result.population as number[]
        }
        res.status(200).json(arrayResponse);
    } catch (error) {
        res.status(500).json({error});
    }
})


// /**
//  * @swagger
//  * /demographics/aggregate/countPerYear:
//  *   post:
//  *     summary: Aggregate demographic data counts per year
//  *     description: Aggregate demographic data counts per year based on the provided filters
//  *     operationId: aggregateCountPerYear
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               demographicDataRequest:
//  *                 $ref: '#/components/schemas/DemographicDataRequest'
//  *               selectionCriteria:
//  *                 $ref: '#/components/schemas/SimpleSelectionCriteria'
//  *     responses:
//  *       200:
//  *         description: Aggregation result per year
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/DemographicDataPerYearResponse'
//  *       404:
//  *         description: No data found for the specified parameters
//  *       500:
//  *         description: Internal server error
//  */
router.post('/aggregate/countPerYear', async (req: Request, res: Response) => {
    await reqToDemographicData(req, res, data, true);
});


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
 *     responses:
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
    const groupedData = groupDataByQueryParamsCombined(filteredData, subroutes);
    res.json(groupedData);
});


/**
 * /demographics/groupby/*:
 *   get:
 *     summary: Retrieve and group demographic data
 *     operationId: groupByDemographicData
 *     description: |
 *       Groups demographic data based on available subroutes:
 *       - `year`
 *       - `age`
 *       - `sex`('M' or 'F')
 *       - `kreis`:district
 *       - `quar`:neighborhood
 *       - `origin`('Schweizer*in' or 'Ausländer*in')
 *       - `age5`(5-year intervals)
 *       - `age10`(10-year intervals)
 *       - `age20`(20-year intervals)
 *       - `population`
 *
 *     parameters:
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: integer
 *         description: The starting year for filtering data
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: integer
 *         description: The ending year for filtering data
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: A specific year for filtering data
 *       - in: query
 *         name: sex
 *         schema:
 *           type: string
 *           enum: ['M', 'F']
 *         description: The gender for filtering data
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *         description: The minimum age for filtering data
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *         description: The maximum age for filtering data
 *       - in: query
 *         name: age
 *         schema:
 *           type: integer
 *         description: The specific age for filtering data
 *       - in: query
 *         name: kreis
 *         schema:
 *           type: integer
 *         description: The district for filtering data
 *       - in: query
 *         name: quar
 *         schema:
 *           type: string
 *         description: The neighborhood for filtering data
 *       - in: query
 *         name: herkunft
 *         schema:
 *           type: string
 *           enum: ['Schweizer*in', 'Ausländer*in']
 *         description: The origin for filtering data
 *     responses:
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
 *       404:
 *         description: No data found for the specified parameters or no subroutes specified
 */
router.get('/groupby/*', (req: Request, res: Response) => {
    const query = mapQueryToDemographicDataRequest(req)
    const filteredData = demographicDataFiltered(query, data)

    const subroutes = req.params[0].split('/').map(subroute => demographicKeyMap[subroute]).filter(Boolean);

    if (filteredData.length === 0) {
        res.status(404).json({message: 'No data found for the specified parameters'});
        return;
    } else if (subroutes.length === 0) {
        res.status(404).json({message: 'No subroutes specified'});
        return;
    }
    const groupedData = groupDataByQueryParamsCombined(filteredData, [...subroutes, 'AnzBestWir']);
    res.json(groupedData);
});


export default router;