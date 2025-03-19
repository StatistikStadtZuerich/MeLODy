import fs from 'fs/promises';
import path from 'path';
import {LinkedDataInterface} from './LinkedDataInterface';
import {ResponseFormatter} from './ResponseFormatter';
import {QueryError} from '../models/errorModels';
import {FormatType} from "../models/models";

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

    private async _ensureTemplateDirectory(): Promise<void> {
        try {
            await fs.access(this.templateRepository);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                try {
                    await fs.mkdir(this.templateRepository, {recursive: true});
                } catch (mkdirError) {
                    console.error('Failed to create template directory:', mkdirError);
                }
            } else {
                console.error('Error accessing template directory:', error);
            }
        }
    }


    /**
     * Executes a direct SPARQL query on the SSZ data source.
     *
     * @param query - The SPARQL query string to execute
     * @param format - The output format for the results (default is 'json')
     * @returns Promise resolving to the query results
     * @throws {QueryError} If an error occurs during query execution
     */
    public async executeSparqlQuery(query: string, format: FormatType = 'json'): Promise<string | undefined> {
        try {
            if (!query?.length) {
                console.warn('Empty SPARQL query');
                return undefined
            }

            const queryWithPrefixes = `${STANDARD_PREFIXES}\n${query}`;

            const results = await this.dataInterface.executeQuery(queryWithPrefixes, 'ssz');

            return this.formatter.format(results, format);
        } catch (error) {
            if (error instanceof QueryError) {
                return undefined;
            }
            console.error('Error executing SPARQL query:', error);
        }
    }
}

const queryMediator = new QueryMediator();
export default queryMediator;