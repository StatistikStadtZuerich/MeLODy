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
        const startTime = Date.now();
        const reqLogger = getRequestLogger(requestId);

        const logContext: any = {
            requestId,
            startTime,
            path: this.templateRepository,
            operation: 'ensureTemplateDirectory'
        };

        try {
            await fs.access(this.templateRepository);

            logContext.exists = true;
            logContext.processingTimeMs = Date.now() - startTime;
            logContext.success = true;

            reqLogger.debug(`Template directory exists`, logContext);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                try {
                    await fs.mkdir(this.templateRepository, {recursive: true});

                    logContext.created = true;
                    logContext.processingTimeMs = Date.now() - startTime;
                    logContext.success = true;

                    reqLogger.debug(`Created template directory`, logContext);
                } catch (mkdirError) {
                    logContext.error = mkdirError instanceof Error ? mkdirError.message : String(mkdirError);
                    logContext.errorCode = (mkdirError as any).code;
                    logContext.processingTimeMs = Date.now() - startTime;
                    logContext.success = false;

                    reqLogger.error('Failed to create template directory', logContext);
                }
            } else {
                logContext.error = error instanceof Error ? error.message : String(error);
                logContext.errorCode = error.code;
                logContext.processingTimeMs = Date.now() - startTime;
                logContext.success = false;

                reqLogger.error('Error accessing template directory', logContext);
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

        const logContext: any = {
            requestId,
            startTime,
            format,
            queryLength: query?.length || 0
        };

        try {
            if (!query?.length) {
                reqLogger.warn('Empty SPARQL query received', logContext);
                return undefined
            }

            logContext.query = query;

            reqLogger.debug('Executing SPARQL query', logContext);

            const queryWithPrefixes = `${STANDARD_PREFIXES}\n${query}`;

            const results = await this.dataInterface.executeQuery(queryWithPrefixes, 'ssz', undefined, requestId);

            const formattedResults = this.formatter.format(results, format);
            logContext.processingTimeMs = Date.now() - startTime;
            logContext.resultSize = formattedResults ? formattedResults.length : 0;
            logContext.success = true;

            reqLogger.debug('SPARQL query executed successfully', logContext);

            return formattedResults;
        } catch (error) {
            logContext.processingTimeMs = Date.now() - startTime;
            logContext.error = error instanceof Error ? error.message : String(error);
            logContext.success = false;

            reqLogger.error('Error executing SPARQL query', logContext);

            if (error instanceof QueryError) {
                return undefined;
            }
        }
    }
}

const queryMediator = new QueryMediator();
export default queryMediator;
