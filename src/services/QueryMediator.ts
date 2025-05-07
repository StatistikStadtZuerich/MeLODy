import fs from 'fs/promises';
import path from 'path';
import {LinkedDataInterface} from './LinkedDataInterface';
import {ResponseFormatter} from './ResponseFormatter';
import {QueryError} from '../models/errorModels';
import {FormatType} from "../models/models";
import {getRequestLogger} from "../utils/logger";

interface QueryMediatorOptions {
    templateRepository?: string;
    dataInterface?: LinkedDataInterface;
    formatter?: ResponseFormatter;
}

const STANDARD_PREFIXES = `
PREFIX cube: <https://cube.link/>
PREFIX schema: <https://schema.org/>
PREFIX sszP: <https://ld.stadt-zuerich.ch/statistics/property/>
PREFIX sszM: <https://ld.stadt-zuerich.ch/statistics/measure/>
PREFIX sszTS: <https://ld.stadt-zuerich.ch/statistics/termset/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
`;

export class QueryMediator {
    private readonly templateRepository: string;
    private dataInterface: LinkedDataInterface;
    private formatter: ResponseFormatter;

    constructor(options: QueryMediatorOptions = {}) {
        this.templateRepository = options.templateRepository || path.join(__dirname, 'templates');
        this.dataInterface = options.dataInterface || new LinkedDataInterface();
        this.formatter = options.formatter || new ResponseFormatter();

        this._ensureTemplateDirectory().then();
    }

    private async _ensureTemplateDirectory(requestId?: string): Promise<void> {
        const reqLogger = getRequestLogger(requestId);
        try {
            await fs.access(this.templateRepository);
            reqLogger.debug(`Template directory exists at ${this.templateRepository}`);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                try {
                    await fs.mkdir(this.templateRepository, {recursive: true});
                    reqLogger.info(`Created template directory at ${this.templateRepository}`);
                } catch (mkdirError) {
                    reqLogger.error('Failed to create template directory', {
                        path: this.templateRepository,
                        error: mkdirError
                    });
                }
            } else {
                reqLogger.error('Error accessing template directory', {
                    path: this.templateRepository,
                    error
                });
            }
        }
    }


    /**
     * Executes a direct SPARQL query on the SSZ data source.
     *
     * @param query - The SPARQL query string to execute
     * @param format - The output format for the results (default is 'json')
     * @param requestId - The unique ID for the current request
     * @returns Promise resolving to the query results
     * @throws {QueryError} If an error occurs during query execution
     */
    public async executeSparqlQuery(query: string, format: FormatType = 'json', requestId?: string): Promise<string | undefined> {
        const startTime = Date.now();
        const reqLogger = getRequestLogger(requestId);
        try {
            if (!query?.length) {
                reqLogger.warn('Empty SPARQL query received');
                return undefined
            }

            reqLogger.debug('Executing SPARQL query', {
                queryLength: query.length,
                format,
                query: query.substring(0, 200) + (query.length > 200 ? '...' : '') // Log first 200 chars for debugging
            });

            const queryWithPrefixes = `${STANDARD_PREFIXES}\n${query}`;

            const results = await this.dataInterface.executeQuery(queryWithPrefixes, 'ssz', undefined, requestId);

            const formattedResults = this.formatter.format(results, format);
            const processingTime = Date.now() - startTime;

            reqLogger.info('SPARQL query executed successfully', {
                processingTimeMs: processingTime,
                format,
                resultSize: formattedResults ? formattedResults.length : 0
            });

            return formattedResults;
        } catch (error) {
            const errorTime = Date.now() - startTime;
            reqLogger.error('Error executing SPARQL query', {
                error,
                processingTimeMs: errorTime,
                format
            });
            if (error instanceof QueryError) {
                return undefined;
            }
        }
    }
}

const queryMediator = new QueryMediator();
export default queryMediator;
