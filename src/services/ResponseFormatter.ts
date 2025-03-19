// responseFormatter.ts

import {FormatType, ResponseFormatterOptions, SparqlBinding, SparqlResults, TableResponse} from "../models/models";
import {FormatterError} from "../models/errorModels";

interface FormatterMethods {
    [key: string]: (data: any) => any;
}

interface TruncateOptions {
    maxItems?: number;
    maxProperties?: number;
    maxStringLength?: number;
}

export class ResponseFormatter {
    private maxResultItems: number;
    private maxProperties: number;
    private maxStringLength: number;
    private formatters: FormatterMethods;

    constructor(options: ResponseFormatterOptions = {}) {
        this.maxResultItems = options.maxResultItems || 100;
        this.maxProperties = options.maxProperties || 20;
        this.maxStringLength = options.maxStringLength || 1000;

        this.formatters = {
            'json': this.formatJson.bind(this),
            'table': this.formatTable.bind(this),
            'text': this.formatText.bind(this),
            'csv': this.formatCsv.bind(this)
        };
    }

    public format(
        results: any,
        format: FormatType = 'json',
        mapping?: Record<string, string> | null,
        options?: TruncateOptions
    ): any {
        try {
            if (results === null || results === undefined) {
                return {error: 'No results returned from the data source'};
            }

            const formatter = this.formatters[format.toLowerCase()];
            if (!formatter) {
                throw new FormatterError(
                    `Unsupported format: ${format}`,
                    'UNSUPPORTED_FORMAT',
                    400
                );
            }

            const transformedData = this.transformData(results, mapping);


            return formatter(transformedData);
        } catch (error) {
            if (error instanceof FormatterError) {
                throw error;
            }

            throw new FormatterError(
                `Formatting failed: ${error instanceof Error ? error.message : String(error)}`,
                'FORMATTING_ERROR',
                500
            );
        }
    }

    private transformData(results: any, mapping?: Record<string, string> | null): any {
        if (!results || !mapping) {
            return results;
        }

        try {
            if (this.isSparqlResults(results)) {
                return this.transformSparqlResults(results, mapping);
            }

            if (Array.isArray(results)) {
                return this.transformArrayResults(results, mapping);
            }

            if (typeof results === 'object' && results !== null) {
                return this.transformObjectResults(results, mapping);
            }

            return results;
        } catch (error) {
            throw new FormatterError(
                `Data transformation failed: ${error instanceof Error ? error.message : String(error)}`,
                'TRANSFORMATION_ERROR',
                500
            );
        }
    }

    private isSparqlResults(results: any): results is SparqlResults {
        return results &&
            results.head &&
            results.results &&
            results.results.bindings;
    }

    private transformSparqlResults(
        results: SparqlResults,
        mapping: Record<string, string>
    ): any[] {
        try {
            const variables = results.head.vars;
            const bindings = results.results.bindings;

            return bindings.map(binding => {
                const item: Record<string, any> = {};

                for (const variable of variables) {
                    if (binding[variable]) {
                        let value = this.extractSparqlValue(binding[variable]);

                        const mappedName = mapping[variable] || variable;
                        item[mappedName] = value;
                    }
                }

                return item;
            });
        } catch (error) {
            throw new FormatterError(
                `SPARQL results transformation failed: ${error instanceof Error ? error.message : String(error)}`,
                'SPARQL_TRANSFORMATION_ERROR',
                500
            );
        }
    }

    private extractSparqlValue(binding: SparqlBinding): any {
        switch (binding.type) {
            case 'uri':
                return binding.value;
            case 'literal':
                return binding.value;
            case 'typed-literal':
                if (binding.datatype === 'http://www.w3.org/2001/XMLSchema#integer' ||
                    binding.datatype === 'http://www.w3.org/2001/XMLSchema#decimal' ||
                    binding.datatype === 'http://www.w3.org/2001/XMLSchema#float' ||
                    binding.datatype === 'http://www.w3.org/2001/XMLSchema#double') {
                    return Number(binding.value);
                } else if (binding.datatype === 'http://www.w3.org/2001/XMLSchema#boolean') {
                    return binding.value === 'true';
                } else if (binding.datatype === 'http://www.w3.org/2001/XMLSchema#dateTime') {
                    return new Date(binding.value).toISOString();
                }
                return binding.value;
            default:
                return binding.value;
        }
    }

    private transformArrayResults(
        results: any[],
        mapping: Record<string, string>
    ): any[] {
        try {
            return results.map(item => this.applyMapping(item, mapping));
        } catch (error) {
            throw new FormatterError(
                `Array results transformation failed: ${error instanceof Error ? error.message : String(error)}`,
                'ARRAY_TRANSFORMATION_ERROR',
                500
            );
        }
    }

    private transformObjectResults(
        results: Record<string, any>,
        mapping: Record<string, string>
    ): Record<string, any> {
        try {
            return this.applyMapping(results, mapping);
        } catch (error) {
            throw new FormatterError(
                `Object results transformation failed: ${error instanceof Error ? error.message : String(error)}`,
                'OBJECT_TRANSFORMATION_ERROR',
                500
            );
        }
    }

    private applyMapping(
        item: any,
        mapping: Record<string, string>
    ): Record<string, any> {
        if (!mapping || !item || typeof item !== 'object') {
            return item;
        }

        const result: Record<string, any> = {};

        for (const [originalPath, mappedKey] of Object.entries(mapping)) {
            if (originalPath.includes('.')) {
                const pathSegments = originalPath.split('.');

                let current: any = item;
                let validPath = true;

                for (let i = 0; i < pathSegments.length - 1; i++) {
                    if (current && current[pathSegments[i]] !== undefined) {
                        current = current[pathSegments[i]];
                    } else {
                        validPath = false;
                        break;
                    }
                }

                if (validPath) {
                    const finalSegment = pathSegments[pathSegments.length - 1];
                    if (current && current[finalSegment] !== undefined) {
                        result[mappedKey] = current[finalSegment];
                    }
                }
            } else {
                if (item[originalPath] !== undefined) {
                    result[mappedKey] = item[originalPath];
                }
            }
        }

        if (Object.keys(result).length === 0) {
            return item;
        }

        return result;
    }

    public truncateResults(
        data: any,
        options: TruncateOptions = {}
    ): any {
        const maxItems = options.maxItems || this.maxResultItems;
        const maxProps = options.maxProperties || this.maxProperties;
        const maxStrLen = options.maxStringLength || this.maxStringLength;

        try {
            if (Array.isArray(data)) {
                const truncatedArray = data.slice(0, maxItems);

                return truncatedArray.map(item => {
                    if (item && typeof item === 'object' && !Array.isArray(item)) {
                        return this.truncateObject(item, maxProps, maxStrLen);
                    }
                    return this.truncateValue(item, maxStrLen);
                });
            }

            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return this.truncateObject(data, maxProps, maxStrLen);
            }

            return this.truncateValue(data, maxStrLen);
        } catch (error) {
            console.error('Truncation error:', error);
            return data;
        }
    }

    private truncateObject(
        obj: Record<string, any>,
        maxProps: number,
        maxStrLen: number
    ): Record<string, any> {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }

        const truncated: Record<string, any> = {};
        const keys = Object.keys(obj).slice(0, maxProps);

        for (const key of keys) {
            const value = obj[key];

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                truncated[key] = this.truncateObject(value, maxProps, maxStrLen);
            } else if (Array.isArray(value)) {
                truncated[key] = value.slice(0, 10).map(item => this.truncateValue(item, maxStrLen));
            } else {
                truncated[key] = this.truncateValue(value, maxStrLen);
            }
        }

        return truncated;
    }

    private truncateValue(value: any, maxStrLen: number): any {
        if (typeof value === 'string' && value.length > maxStrLen) {
            return value.substring(0, maxStrLen) + '...';
        }
        return value;
    }

    private formatJson(data: any): any {
        return data;
    }

    private formatTable(data: any): TableResponse {
        try {
            if (!data) {
                return {headers: [], rows: []};
            }

            const dataArray = Array.isArray(data) ? data : [data];

            if (dataArray.length === 0) {
                return {headers: [], rows: []};
            }

            const headers = Array.from(
                new Set(
                    dataArray.flatMap(item =>
                        item && typeof item === 'object' ? Object.keys(item) : []
                    )
                )
            );

            const rows = dataArray.map(item => {
                if (!item || typeof item !== 'object') {
                    return headers.map(() => String(item));
                }

                return headers.map(header => {
                    const value = item[header];

                    if (value === undefined || value === null) {
                        return '';
                    } else if (typeof value === 'object') {
                        return JSON.stringify(value);
                    } else {
                        return String(value);
                    }
                });
            });

            return {
                headers,
                rows
            };
        } catch (error) {
            throw new FormatterError(
                `Table formatting failed: ${error instanceof Error ? error.message : String(error)}`,
                'TABLE_FORMAT_ERROR',
                500
            );
        }
    }

    private formatText(data: any): string {
        try {
            if (!data) {
                return '';
            }

            if (typeof data !== 'object') {
                return String(data);
            }

            if (Array.isArray(data)) {
                return data.map(item => this.formatTextItem(item)).join('\n\n');
            }

            return this.formatTextItem(data);
        } catch (error) {
            throw new FormatterError(
                `Text formatting failed: ${error instanceof Error ? error.message : String(error)}`,
                'TEXT_FORMAT_ERROR',
                500
            );
        }
    }

    private formatTextItem(item: any): string {
        if (!item || typeof item !== 'object') {
            return String(item);
        }

        return Object.entries(item)
            .map(([key, value]) => {
                if (value === null || value === undefined) {
                    return `${key}: N/A`;
                } else if (typeof value === 'object') {
                    return `${key}: ${JSON.stringify(value)}`;
                } else {
                    return `${key}: ${value}`;
                }
            })
            .join('\n');
    }

    private formatCsv(data: any): string {
        try {
            if (!data) {
                return '';
            }

            const dataArray = Array.isArray(data) ? data : [data];

            if (dataArray.length === 0) {
                return '';
            }

            const headers = Array.from(
                new Set(
                    dataArray.flatMap(item =>
                        item && typeof item === 'object' ? Object.keys(item) : []
                    )
                )
            );

            const csvRows = [headers.map(this.escapeCsvValue).join(',')];

            dataArray.forEach(item => {
                if (!item || typeof item !== 'object') {
                    csvRows.push(headers.map(() => this.escapeCsvValue(String(item))).join(','));
                    return;
                }

                const row = headers.map(header => {
                    const value = item[header];

                    if (value === undefined || value === null) {
                        return '';
                    } else if (typeof value === 'object') {
                        return this.escapeCsvValue(JSON.stringify(value));
                    } else {
                        return this.escapeCsvValue(String(value));
                    }
                });

                csvRows.push(row.join(','));
            });

            return csvRows.join('\n');
        } catch (error) {
            throw new FormatterError(
                `CSV formatting failed: ${error instanceof Error ? error.message : String(error)}`,
                'CSV_FORMAT_ERROR',
                500
            );
        }
    }

    private escapeCsvValue(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }

        const stringValue = String(value);

        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
    }
}