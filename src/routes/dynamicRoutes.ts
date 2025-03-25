import {Router} from "express";
import queryProcessor from "../services/sqlite/queryProcessor";
import {DataQuery} from "../models/DatasetDefinition";
import {initializeDatasets, storeDataset} from "../services/sqlite/datasetInitializer";
import queryMediator from "../services/QueryMediator";
import {parseCSVFromAPI} from "../utils/csvUtils";
import {allDatasets} from "../models/datasetDefinitions/allDatasets";


initializeDatasets(allDatasets.map(item => item.definition)).then(initiatedDataSets => {
    for (const dataset of initiatedDataSets) {
        const query = allDatasets.find(item => item.definition.id === dataset)?.sparqlQuery
        if (!query) {
            console.error(`No SPARQL query found for dataset ${dataset}`)
            return;
        }
        queryMediator.executeSparqlQuery(query).then(async result => {
            if (result) {
                storeDataset(dataset, await parseCSVFromAPI<unknown>(result)).then(success => {
                    console.log(`Stored ${dataset} dataset ${success}`)
                })
            } else {
                console.error(`No result found for dataset ${dataset}`)
            }
        }).catch((error) => {
            console.error(error);
        });
    }
});


const router = Router();


/**
 * @swagger
 * /datasets:
 *   get:
 *     operationId: datasetReceiver
 *     summary: Retrieve all available datasets
 *     description: Returns a list of all datasets available in the system
 *     tags:
 *       - Datasets
 *     responses:
 *       200:
 *         description: List of datasets successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datasets:
 *                   $ref: '#/components/schemas/DatasetDefinitions'
 *       500:
 *         description: Server error while fetching datasets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/datasets', async (req, res) => {
    try {
        const datasets = await queryProcessor.getDatasets();
        res.status(200).json({datasets});
    } catch (error) {
        console.error('Error fetching datasets:', error);
        res.status(500).json({error: 'Failed to fetch datasets'});
    }
});

/**
 * @swagger
 * /query:
 *   post:
 *     operationId: dataQuery
 *     summary: Query dataset data
 *     description: Executes a query against a specified dataset with optional filters and sorting
 *     tags:
 *       - Queries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DataQuery'
 *     responses:
 *       200:
 *         description: Query executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 dataset:
 *                   type: string
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error while executing query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/query', async (req, res) => {
    try {
        const query = req.body as DataQuery;

        if (!query.datasetId) {
            res.status(400).json({error: 'datasetId is required'});
            return;
        }

        const results = await queryProcessor.query(query);

        res.status(200).json({
            results,
            count: results.length,
            dataset: query.datasetId
        });
    } catch (error: any) {
        console.error('Error executing query:', error);
        res.status(500).json({error: error.message});
    }
});

export default router;