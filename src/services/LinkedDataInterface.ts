// linkedDataInterface.ts
import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import fs from 'fs/promises';
import path from 'path';
import {SourceConfig, SourceConfigs} from "../models/models";
import {LinkedDataError} from "../models/errorModels";

interface LinkedDataInterfaceOptions {
    configPath?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
}

export class LinkedDataInterface {
    private readonly configPath: string;
    private readonly defaultTimeout: number;
    private readonly maxRetries: number;
    private readonly retryDelay: number;
    private sourceConfigs: SourceConfigs;
    private sourceConfigsLoaded: boolean;

    constructor(options: LinkedDataInterfaceOptions = {}) {
        this.configPath = options.configPath || path.join(__dirname, 'config', 'sources.json');
        this.defaultTimeout = options.timeout || 30000; // 30 seconds
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000; // 1 second
        this.sourceConfigs = {};
        this.sourceConfigsLoaded = false;
    }

    async loadSourceConfigs(): Promise<SourceConfigs> {
        if (this.sourceConfigsLoaded) {
            return this.sourceConfigs;
        }

        try {
            const configDir = path.dirname(this.configPath);
            try {
                await fs.access(configDir);
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    await fs.mkdir(configDir, {recursive: true});
                } else {
                    throw error;
                }
            }

            try {
                const configData = await fs.readFile(this.configPath, 'utf8');
                this.sourceConfigs = JSON.parse(configData);
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    const defaultConfigs: SourceConfigs = {
                        'ssz': {
                            type: 'sparql',
                            endpoint: 'https://ld.integ.stzh.ch/query',
                            format: 'csv',
                            timeout: 45000
                        }
                    };

                    await fs.writeFile(this.configPath, JSON.stringify(defaultConfigs, null, 2));
                    this.sourceConfigs = defaultConfigs;
                } else if (error instanceof SyntaxError) {
                    throw new LinkedDataError(
                        'Invalid source configuration file format',
                        'INVALID_CONFIG_FORMAT',
                        500
                    );
                } else {
                    throw error;
                }
            }

            this.sourceConfigsLoaded = true;
            return this.sourceConfigs;
        } catch (error) {
            if (error instanceof LinkedDataError) {
                throw error;
            }

            throw new LinkedDataError(
                `Failed to load source configurations: ${error instanceof Error ? error.message : String(error)}`,
                'CONFIG_LOAD_ERROR',
                500
            );
        }
    }

    async loadSourceConfig(sourceName: string): Promise<SourceConfig> {
        await this.loadSourceConfigs();

        if (!this.sourceConfigs[sourceName]) {
            throw new LinkedDataError(
                `Source configuration not found for: ${sourceName}`,
                'SOURCE_NOT_FOUND',
                404
            );
        }

        return this.sourceConfigs[sourceName];
    }

    async executeQuery(query: string, sourceName: string, config?: SourceConfig): Promise<any> {
        try {
            const sourceConfig = config || await this.loadSourceConfig(sourceName);

            switch (sourceConfig.type) {
                case 'sparql':
                    return this.executeSparqlQuery(query, sourceConfig);
                case 'rest':
                    return this.executeRESTQuery(query, sourceConfig);
                default:
                    throw new LinkedDataError(
                        `Unsupported query type: ${sourceConfig.type}`,
                        'UNSUPPORTED_QUERY_TYPE',
                        400
                    );
            }
        } catch (error) {
            if (error instanceof LinkedDataError) {
                throw error;
            }

            throw new LinkedDataError(
                `Query execution failed: ${error instanceof Error ? error.message : String(error)}`,
                'QUERY_EXECUTION_ERROR',
                500
            );
        }
    }

    async executeSparqlQuery(query: string, config: SourceConfig): Promise<any> {
        query = this.processSparqlQueryTemplate(query);

        const params: Record<string, string> = {
            query,
            format: config.format || 'json'
        };

        if (config.defaultGraphUri) {
            params.default_graph_uri = config.defaultGraphUri;
        }

        const usePost = query.length > 2000;

        const options: AxiosRequestConfig = {
            method: usePost ? 'POST' : 'GET',
            url: config.endpoint,
            timeout: config.timeout || this.defaultTimeout,
            headers: {
                'Accept': config.format === 'csv'
                    ? 'text/csv'
                    : config.format === 'json' || !config.format
                        ? 'application/sparql-results+json'
                        : `application/sparql-results+${config.format}`,

                ...(config.headers || {})
            },
            validateStatus: (status: number) => status >= 200 && status < 300
        };

        if (usePost) {
            options.headers = {
                ...options.headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            const formData = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                formData.append(key, value);
            }
            options.data = formData;
        } else {
            options.params = params;
        }

        console.log(`Executing SPARQL query on ${config.endpoint}`);

        return this.executeWithRetry(options);
    }

    /**
     * Process a SPARQL query template that may include conditional sections
     * Handles sections like {{#if variable}}...{{/if}}
     */
    private processSparqlQueryTemplate(query: string): string {
        const ifRegex = /{{#if\s+([^}]+)}}\s*([\s\S]*?)\s*{{\/if}}/g;

        return query.replace(ifRegex, (match, condition, content) => {
            const conditionValue = condition.trim();
            if (!conditionValue || conditionValue === 'false' || conditionValue === '0') {
                return '';
            }
            return content;
        });
    }

    async executeRESTQuery(query: string, config: SourceConfig): Promise<any> {
        let params: Record<string, any>;
        try {
            params = typeof query === 'string' ? JSON.parse(query) : query;
        } catch (error) {
            throw new LinkedDataError(
                'Invalid REST query parameters: must be valid JSON',
                'INVALID_QUERY_FORMAT',
                400
            );
        }

        const options: AxiosRequestConfig = {
            method: config.method || 'GET',
            url: config.endpoint,
            timeout: config.timeout || this.defaultTimeout,
            headers: {
                'Accept': 'application/json',
                ...(config.headers || {})
            },
            validateStatus: (status: number) => status >= 200 && status < 300
        };

        if (['GET', 'DELETE'].includes(options.method || '')) {
            options.params = params;
        } else {
            options.data = params;
        }

        return this.executeWithRetry(options);
    }

    async executeWithRetry(options: AxiosRequestConfig): Promise<any> {
        let lastError: Error | AxiosError | unknown;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await axios(options);
                return response.data;
            } catch (error) {
                lastError = error;

                const isRetryable = this.isRetryableError(error);
                if (!isRetryable || attempt === this.maxRetries) {
                    break;
                }

                await this.delay(this.retryDelay * attempt);
            }
        }

        const axiosError = lastError as AxiosError;
        // @ts-ignore
        const errorMessage = axiosError.response?.data?.error ||
            (axiosError.message || 'Unknown error');
        const errorCode = axiosError.response?.status || 500;

        throw new LinkedDataError(
            `Query failed after ${this.maxRetries} attempts: ${errorMessage}`,
            `QUERY_FAILED_${errorCode}`,
            errorCode
        );
    }

    isRetryableError(error: unknown): boolean {
        const axiosError = error as AxiosError;
        if (!axiosError.response) {
            return true;
        }

        const status = axiosError.response.status;
        return status >= 500 && status < 600;
    }

    delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}