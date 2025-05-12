import {Router} from "express";
import queryMediator from "../services/QueryMediator";
import {getAllDatasets} from "../models/datasetDefinitions/allDatasets";
import {storeCSVInSQLite} from "../utils/csvSqliteUtils";
import {executeSQLiteQuery, getPrettyDatabaseSchema} from "../utils/sqliteUtils";
import {compressJsonWithIdMapping, extractTablesFromQuery} from "../utils/dataUtils";
import {readFileWithTypeCheck} from "../utils/csvUtils";
import {getRequestLogger} from "../utils/logger";

const startTime = Date.now();

let datasetsReady = false;
const allPromises: Promise<void>[] = [];

getAllDatasets().forEach(dataset => {
    const datasetRequestId = `dataset-load-${dataset.id}`;
    const reqLogger = getRequestLogger(datasetRequestId);
    reqLogger.info(`Executing query for dataset`, {datasetId: dataset.id});
    let dataPromise: Promise<any> | undefined;
    if (dataset.sparqlQuery) {
        dataPromise = queryMediator.executeSparqlQuery(dataset.sparqlQuery, 'json', datasetRequestId)
    } else if (dataset.file) {
        dataPromise = readFileWithTypeCheck(dataset.file)
    }

    if (dataPromise) {
        const processPromise = dataPromise.then(async result => {
            if (result) {
                try {
                    const storedItems = await storeCSVInSQLite(result, dataset.id, undefined, true);
                    reqLogger.info(`Stored items for dataset`, {
                        datasetId: dataset.id,
                        itemCount: storedItems
                    });
                } catch (error) {
                    reqLogger.error(`Error storing dataset`, {
                        datasetId: dataset.id,
                        error
                    });
                }
            } else {
                reqLogger.error(`No result found for dataset`, {datasetId: dataset.id});
            }
        });


        allPromises.push(processPromise);
    }
});

const allDatasetsRequestId = 'all-datasets-load';
const allDatasetsLogger = getRequestLogger(allDatasetsRequestId);

Promise.all(allPromises)
    .then(() => {
        datasetsReady = true;
        const endTime = Date.now();
        const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
        allDatasetsLogger.info(`All datasets stored successfully`, {
            processingTimeSeconds: totalTimeSeconds,
            datasetsCount: getAllDatasets().length
        });
    })
    .catch(error => {
        const endTime = Date.now();
        const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
        allDatasetsLogger.error(`Error processing datasets`, {
            processingTimeSeconds: totalTimeSeconds,
            error
        });
    });

export const readynessRouter = Router();
readynessRouter.get('/_/ready', (_req, res) => {
    if (datasetsReady) {
        res.status(200).send();
    } else {
        res.status(503).send();
    }
})


export const openaiRouter = Router();

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
openaiRouter.get('/schemas', async (req, res) => {
    const reqLogger = getRequestLogger(req.requestId);
    reqLogger.debug('GET /schemas request received');
    try {
        const startTime = Date.now();
        const schemas = getPrettyDatabaseSchema(req.requestId);
        const processingTime = Date.now() - startTime;

        reqLogger.debug('Schemas fetched successfully', {
            processingTimeMs: processingTime,
            schemaCount: Object.keys(schemas).length
        });

        res.status(200).json(schemas);
    } catch (error) {
        reqLogger.error('Error fetching schemas', {error});
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
openaiRouter.post('/query', async (req, res) => {
    const startTime = Date.now();
    const reqLogger = getRequestLogger(req.requestId);
    reqLogger.debug('POST /query request received');

    try {
        const {query} = req.body || {};
        if (!query) {
            reqLogger.warn('Query request missing required query parameter');
            res.status(400).json({error: 'query is required'});
            return;
        }

        const queryStartTime = Date.now();
        const results = executeSQLiteQuery(query, req.requestId);
        const queryTime = Date.now() - queryStartTime;

        reqLogger.debug('Query executed successfully', {
            resultCount: results.length,
            executionTimeMs: queryTime
        });

        const compressionStartTime = Date.now();
        const compressedResults = compressJsonWithIdMapping(results);
        const compressionTime = Date.now() - compressionStartTime;

        const datasets = Array.from(
            new Set(extractTablesFromQuery(query)
                .map(item =>
                    (item.source ? item.source : item.file?.split('/').pop()
                        ?.replace(/\.zip$/i, ''))
                ).filter(Boolean))
        ) as string[];

        const resultsWithDatasets = {...compressedResults, sources: datasets};

        const totalProcessingTime = Date.now() - startTime;
        reqLogger.debug('Query processed successfully', {
            resultCount: results.length,
            datasetCount: datasets.length,
            queryTimeMs: queryTime,
            query: query,
            compressionTimeMs: compressionTime,
            totalProcessingTimeMs: totalProcessingTime
        });

        res.status(200).json(JSON.stringify(resultsWithDatasets));
    } catch (error) {
        const errorTime = Date.now() - startTime;
        reqLogger.error('Error executing query', {
            error,
            processingTimeMs: errorTime
        });
        res.status(500).json({error: error});
    }
});

