import {Router} from "express";
import queryMediator from "../services/QueryMediator";
import {parseCSVFromAPI} from "../utils/csvUtils";

/**
 * @swagger
 * components:
 *   schemas:
 *     DatasetDefinition:
 *       type: object
 *       description: |
 *         Dataset definition containing metadata and query structure information.
 *         - id: Unique identifier for this dataset
 *         - name: Human-readable name
 *         - description: Description of what the dataset contains
 *         - datasetUri: The main URI for the dataset (used in WHERE clause)
 *         - variables: Array of variables to select with name, description, and type (string|number|date)
 *         - predicates: Array of graph paths with path, optional fixedValue, optional variableName, and description
 *       required:
 *         - id
 *         - name
 *         - description
 *         - datasetUri
 *         - variables
 *         - predicates
 *       example:
 *         id: population
 *         name: Population Data
 *         description: Economic residential population of Zurich by year
 *         datasetUri: https://ld.stadt-zuerich.ch/statistics/000201/observation
 *         variables:
 *           - name: Datum
 *             description: Date/time of the observation
 *             type: date
 *           - name: Wirtschaftliche_Wohnbevoelkerung
 *             description: Economic residential population count
 *             type: number
 *         predicates:
 *           - path: sszP:ZEIT/schema:inDefinedTermSet
 *             fixedValue: sszTS:Jahr
 *             description: Specifies that time is measured in years
 */

export interface DatasetDefinition {
    id: string;
    name: string;
    description: string;

    datasetUri: string;

    variables: {
        name: string;
        description: string;
        type: 'string' | 'number' | 'date';
    }[];

    predicates: {
        path: string;
        fixedValue?: string;
        variableName?: string;
        description: string;
    }[];
}

export type DatasetDefinitions = DatasetDefinition[];

const populationDatasetDefinition: DatasetDefinition = {
    id: 'population',
    name: 'Population Data',
    description: 'Economic residential population of Zurich by year',
    datasetUri: 'https://ld.stadt-zuerich.ch/statistics/000201/observation',
    variables: [
        {
            name: 'Datum',
            description: 'Date/time of the observation (typically processed to extract year)',
            type: 'date'
        },
        {
            name: 'Wirtschaftliche_Wohnbevoelkerung',
            description: 'Economic residential population count',
            type: 'number'
        }
    ],
    predicates: [
        {
            path: 'sszP:ZEIT/schema:inDefinedTermSet',
            fixedValue: 'sszTS:Jahr',
            description: 'Specifies that time is measured in years'
        },
        {
            path: 'sszP:TIME',
            variableName: 'Datum',
            description: 'The actual date value'
        },
        {
            path: 'sszM:BEW',
            variableName: 'Wirtschaftliche_Wohnbevoelkerung',
            description: 'The population count measurement'
        },
        {
            path: 'sszP:RAUM',
            fixedValue: '<https://ld.stadt-zuerich.ch/statistics/code/R30000>',
            description: 'Specifies the geographic area (Zurich)'
        }
    ]
};

const datasetDefinitions: DatasetDefinitions = [populationDatasetDefinition];

const router = Router();

/**
 * @swagger
 * /api/datasets/definitions:
 *   get:
 *     summary: Get all dataset definitions
 *     tags: [Datasets]
 *     responses:
 *       200:
 *         description: List of all dataset definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DatasetDefinition'
 */

router.get('/definitions', async (req, res) => {
    res.status(200).json(datasetDefinitions);
});

/**
 * @swagger
 * /api/datasets:
 *   post:
 *     summary: Execute a SPARQL query
 *     tags: [Datasets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 description: SPARQL query to execute
 *     responses:
 *       200:
 *         description: Parsed query results
 *       400:
 *         description: Missing query or no results found
 */
router.post('/', async (req, res) => {
    const {query} = req.body || {};
    if (!query) {
        res.status(400).json({error: 'No query provided'});
        return;
    }

    const result = await queryMediator.executeSparqlQuery(query);
    if (!result) {
        res.status(400).json({error: 'No data found for the specified query'});
        return;
    }
    const data = await parseCSVFromAPI(result);
    res.status(200).json(data);
})


export default router;