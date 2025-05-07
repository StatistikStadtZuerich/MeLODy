import {Router} from "express";
import queryMediator from "../services/QueryMediator";
import {getAllDatasets} from "../models/datasetDefinitions/allDatasets";
import {storeCSVInSQLite} from "../utils/csvSqliteUtils";
import {executeSQLiteQuery, getPrettyDatabaseSchema} from "../utils/sqliteUtils";
import {compressJsonWithIdMapping, extractTablesFromQuery} from "../utils/dataUtils";
import {readFileWithTypeCheck} from "../utils/csvUtils";

const startTime = Date.now();

let datasetsReady = false;
// Collect all promises
const allPromises: Promise<void>[] = [];

getAllDatasets().forEach(dataset => {
    console.log(`Executing query for dataset ${dataset.id}`);
    let dataPromise: Promise<any> | undefined;
    if (dataset.sparqlQuery) {
        dataPromise = queryMediator.executeSparqlQuery(dataset.sparqlQuery)
    } else if (dataset.file) {
        dataPromise = readFileWithTypeCheck(dataset.file)
    }

    if (dataPromise) {
        // Convert each dataset processing into a promise and collect it
        const processPromise = dataPromise.then(async result => {
            if (result) {
                try {
                    const storedItems = await storeCSVInSQLite(result, dataset.id, undefined, true);
                    console.log(`Stored ${storedItems} items for dataset ${dataset.id}`);
                } catch (error) {
                    console.error(`Error storing dataset ${dataset.id}: ${error}`);
                }
            } else {
                console.error(`No result found for dataset ${dataset.id}`)
            }
        });

        allPromises.push(processPromise);
    }
});

Promise.all(allPromises)
    .then(() => {
        datasetsReady = true;
        const endTime = Date.now();
        const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`All datasets stored successfully in ${totalTimeSeconds} seconds`);
    })
    .catch(error => {
        const endTime = Date.now();
        const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
        console.error(`Error processing datasets after ${totalTimeSeconds} seconds:`, error);
    });

export const readynessRouter = Router();

readynessRouter.get('/_/ready', (req, res) => {
    if (datasetsReady) {
        res.status(200).send();
    } else {
        res.status(503).send();
    }
})


const router = Router();

/**
 * @swagger
 * /schemas:
 *   get:
 *     summary: Retrieve all available schemas
 *     description: Returns a list of all schema information
 *     operationId: getSchemas
 *     responses:
 *       200:
 *         description: Successfully retrieved schemas
 */
router.get('/schemas', async (req, res) => {
    try {
        const schemas = getPrettyDatabaseSchema()
        res.status(200).json(schemas);
    } catch (error) {
        console.error('Error fetching schemas:', error);
        res.status(500).json({error: 'Failed to fetch schemas'});
    }
});

/**
 * @swagger
 * /query:
 *   post:
 *     summary: Execute a SQLite query against the schemas
 *     description: Run a custom SQL query on the SQLite database and return results
 *     operationId: executeQuery
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required: [query]
 *              properties:
 *                query:
 *                  type: string
 *                  example: "SELECT * FROM dataset_name LIMIT 10"
 *     responses:
 *       200:
 *         description: A compressed data structure containing both the query results and an ID-to-name mapping dictionary. The compression reduces payload size by replacing repeated string values with numeric IDs.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.post('/query', async (req, res) => {
    try {
        const {query} = req.body || {};
        if (!query) {
            res.status(400).json({error: 'query is required'});
            return;
        }
        const results = executeSQLiteQuery(query);
        const compressedResults = compressJsonWithIdMapping(results)
        const datasets = Array.from(new Set(extractTablesFromQuery(query).map(item => (item.source ? item.source : item.file?.split('/').pop()?.replace(/\.zip$/i, '')
            )
        ).filter(Boolean))) as string[];
        const resultsWithDatasets = {...compressedResults, sources: datasets};
        res.status(200).json(JSON.stringify(resultsWithDatasets));
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({error: error});
    }
});

export default router;
