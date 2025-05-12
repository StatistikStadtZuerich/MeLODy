import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import fs from 'fs/promises';
import path from 'path';
import {SourceConfig, SourceConfigs} from "../models/models";
import {LinkedDataError} from "../models/errorModels";
import {SPARQL_ENDPOINT} from "../server";
import {getRequestLogger} from "../utils/logger";

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
    private runQueue: string[] = []

    constructor(options: LinkedDataInterfaceOptions = {}) {
        this.configPath = options.configPath || path.join(__dirname, 'config', 'sources.json');
        this.defaultTimeout = options.timeout || 500000; // 90 seconds
        this.maxRetries = options.maxRetries || 10;
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
                if (this.sourceConfigs["ssz"]) {
                    this.sourceConfigs["ssz"].endpoint = SPARQL_ENDPOINT;
                }
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    const defaultConfigs: SourceConfigs = {
                        'ssz': {
                            type: 'sparql',
                            endpoint: SPARQL_ENDPOINT,
                            format: 'csv',
                            timeout: this.defaultTimeout
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

    async executeQuery(query: string, sourceName: string, config?: SourceConfig, requestId?: string): Promise<any> {
        const reqLogger = getRequestLogger(requestId);
        try {
            const sourceConfig = config || await this.loadSourceConfig(sourceName);

            switch (sourceConfig.type) {
                case 'sparql':
                    return this.executeSparqlQuery(query, sourceConfig, requestId);
                case 'rest':
                    return this.executeRESTQuery(query, sourceConfig, requestId);
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

            reqLogger.error(`Query execution failed`, {
                error: error instanceof Error ? error.message : String(error),
                sourceName
            });

            throw new LinkedDataError(
                `Query execution failed: ${error instanceof Error ? error.message : String(error)}`,
                'QUERY_EXECUTION_ERROR',
                500
            );
        }
    }

    async executeSparqlQuery(query: string, config: SourceConfig, requestId?: string): Promise<any> {
        const startTime = Date.now();
        const reqLogger = getRequestLogger(requestId);
        query = this.processSparqlQueryTemplate(query);

        const logContext: any = {
            requestId,
            startTime,
            endpoint: config.endpoint,
            queryLength: query.length,
            format: config.format || 'json',
            queryType: 'SPARQL'
        };

        const params: Record<string, string> = {
            query,
            format: config.format || 'json'
        };

        if (config.defaultGraphUri) {
            params.default_graph_uri = config.defaultGraphUri;
            logContext.defaultGraphUri = config.defaultGraphUri;
        }

        const usePost = query.length > 2000;
        logContext.method = usePost ? 'POST' : 'GET';
        logContext.timeout = config.timeout || this.defaultTimeout;

        const options: AxiosRequestConfig = {
            method: logContext.method,
            url: config.endpoint,
            timeout: logContext.timeout,
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

        logContext.query = query

        reqLogger.debug(`Executing SPARQL query`, logContext);

        try {
            const result = await this.executeWithRetry(options, requestId);
            logContext.processingTimeMs = Date.now() - startTime;
            logContext.resultSize = typeof result === 'string' ? result.length : JSON.stringify(result).length;
            logContext.success = true;

            reqLogger.debug(`SPARQL query completed`, logContext);

            return result;
        } catch (error) {
            logContext.processingTimeMs = Date.now() - startTime;
            logContext.error = error instanceof Error ? error.message : String(error);
            logContext.success = false;

            reqLogger.error(`SPARQL query failed`, logContext);

            throw error;
        }
    }

    private processSparqlQueryTemplate(query: string): string {
        const ifRegex = /{{#if\s+([^}]+)}}\s*([\s\S]*?)\s*{{\/if}}/g;

        return query.replace(ifRegex, (_match, condition, content) => {
            const conditionValue = condition.trim();
            if (!conditionValue || conditionValue === 'false' || conditionValue === '0') {
                return '';
            }
            return content;
        });
    }

    async executeRESTQuery(query: string, config: SourceConfig, requestId?: string): Promise<any> {
        const startTime = Date.now();
        const reqLogger = getRequestLogger(requestId);

        const logContext: any = {
            requestId,
            startTime,
            endpoint: config.endpoint,
            method: config.method || 'GET',
            timeout: config.timeout || this.defaultTimeout,
            queryType: 'REST'
        };

        let params: Record<string, any>;
        try {
            params = typeof query === 'string' ? JSON.parse(query) : query;

            const queryStr = JSON.stringify(params);
            logContext.queryLength = queryStr.length;
            logContext.query = queryStr.substring(0, 200) + (queryStr.length > 200 ? '...' : '');

        } catch (error) {
            logContext.error = error instanceof Error ? error.message : String(error);
            logContext.success = false;

            reqLogger.error('Invalid REST query parameters', logContext);
            throw new LinkedDataError(
                'Invalid REST query parameters: must be valid JSON',
                'INVALID_QUERY_FORMAT',
                400
            );
        }

        const options: AxiosRequestConfig = {
            method: logContext.method,
            url: config.endpoint,
            timeout: logContext.timeout,
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

        reqLogger.debug('Executing REST query', logContext);

        try {
            const result = await this.executeWithRetry(options, requestId);
            logContext.processingTimeMs = Date.now() - startTime;
            logContext.resultSize = typeof result === 'string' ? result.length : JSON.stringify(result).length;
            logContext.success = true;

            reqLogger.debug('REST query completed', logContext);

            return result;
        } catch (error) {
            logContext.processingTimeMs = Date.now() - startTime;
            logContext.error = error instanceof Error ? error.message : String(error);
            logContext.success = false;

            reqLogger.error('REST query failed', logContext);

            throw error;
        }
    }

    async executeWithRetry(options: AxiosRequestConfig, requestId?: string): Promise<any> {
        let lastError: Error | AxiosError | unknown;
        const startTime = Date.now();
        const reqLogger = getRequestLogger(requestId);

        const logContext: any = {
            requestId,
            url: options.url,
            method: options.method,
            query: options.data instanceof URLSearchParams
                ? options.data.get('query')
                : options.params?.query || options.data,
            startTime
        };

        while (this.runQueue.length > 0) {
            await this.delay(100);
        }

        this.runQueue.push('process');
        reqLogger.debug(`Starting query execution`, logContext);

        try {
            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    logContext.attempt = attempt;
                    logContext.maxRetries = this.maxRetries;

                    reqLogger.info(`Executing query`, logContext);

                    const requestStartTime = Date.now();
                    const response = await axios(options);
                    const requestTime = Date.now() - requestStartTime;

                    logContext.statusCode = response.status;
                    logContext.responseTimeMs = requestTime;
                    logContext.totalTimeMs = Date.now() - startTime;
                    logContext.dataSize = typeof response.data === 'string'
                        ? response.data.length
                        : JSON.stringify(response.data).length;

                    reqLogger.debug(`Query executed successfully`, logContext);

                    return response.data;
                } catch (error) {
                    lastError = error;
                    const axiosError = error as AxiosError;
                    logContext.statusCode = axiosError.response?.status;
                    logContext.attempt = attempt;
                    logContext.errorMessage = axiosError.message;

                    reqLogger.warn(`Query attempt failed`, logContext);

                    const isRetryable = this.isRetryableError(error);
                    if (!isRetryable || attempt === this.maxRetries) {
                        logContext.isRetryable = isRetryable;
                        logContext.isLastAttempt = attempt === this.maxRetries;

                        reqLogger.debug(`Not retrying query`, logContext);
                        break;
                    }

                    const delayTime = this.retryDelay * attempt;
                    logContext.delayMs = delayTime;

                    reqLogger.debug(`Retrying query after delay`, logContext);
                    await this.delay(delayTime);
                }
            }

            const axiosError = lastError as AxiosError;
            // @ts-ignore
            const errorMessage = axiosError.response?.data?.error ||
                (axiosError.message || 'Unknown error');
            const errorCode = axiosError.response?.status || 500;

            logContext.totalTimeMs = Date.now() - startTime;
            logContext.errorCode = errorCode;
            logContext.errorMessage = errorMessage;

            reqLogger.error(`Query failed after maximum retries`, logContext);

            throw new LinkedDataError(
                `Query failed after ${this.maxRetries} attempts: ${errorMessage}`,
                `QUERY_FAILED_${errorCode}`,
                errorCode
            );
        } finally {
            this.runQueue.shift();
            logContext.queueLength = this.runQueue.length;
            reqLogger.debug(`Query execution complete, removed from queue`, logContext);
        }
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
