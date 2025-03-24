import {SparqlBinding, SparqlResults} from "../models/models";

/**
 * Utility functions for working with SPARQL queries and results
 * specifically tailored for Stadt Zürich linked data
 */
export class SparqlHelper {
    /**
     * Creates a FILTER statement for case-insensitive string search
     * @param variable SPARQL variable name (without ?)
     * @param value Search term
     * @returns SPARQL FILTER statement
     */
    static createTextFilter(variable: string, value: string): string {
        if (!value) return '';
        const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return `FILTER(REGEX(?${variable}, "${escaped}", "i"))`;
    }

    /**
     * Extract a specific data type from SPARQL results
     * @param results SPARQL query results
     * @param type RDF type URI to filter by
     * @returns Filtered result set
     */
    static filterByType(results: SparqlResults, type: string): SparqlResults {
        if (!results || !results.results || !results.results.bindings) {
            return results;
        }

        const filtered = {
            ...results,
            results: {
                ...results.results,
                bindings: results.results.bindings.filter(binding => {
                    return binding.type && binding.type.value === type;
                })
            }
        };

        return filtered;
    }

    /**
     * Simplifies SPARQL results to a flat array of objects
     * @param results SPARQL query results
     * @returns Array of simplified objects
     */
    static simplifyResults(results: SparqlResults): Record<string, any>[] {
        if (!results || !results.results || !results.results.bindings) {
            return [];
        }

        const variables = results.head.vars;
        return results.results.bindings.map(binding => {
            const obj: Record<string, any> = {};

            for (const variable of variables) {
                if (binding[variable]) {
                    obj[variable] = this.extractValue(binding[variable]);
                }
            }

            return obj;
        });
    }

    /**
     * Extract appropriate JavaScript value from SPARQL binding
     * @param binding SPARQL binding value
     * @returns Appropriate JavaScript value
     */
    static extractValue(binding: SparqlBinding): any {
        switch (binding.type) {
            case 'uri':
                return binding.value;
            case 'literal':
                if (binding['xml:lang']) {
                    return {value: binding.value, language: binding['xml:lang']};
                }
                return binding.value;
            case 'typed-literal':
                if (binding.datatype === 'http://www.w3.org/2001/XMLSchema#integer' ||
                    binding.datatype === 'http://www.w3.org/2001/XMLSchema#decimal' ||
                    binding.datatype === 'http://www.w3.org/2001/XMLSchema#float' ||
                    binding.datatype === 'http://www.w3.org/2001/XMLSchema#double') {
                    return Number(binding.value);
                } else if (binding.datatype === 'http://www.w3.org/2001/XMLSchema#boolean') {
                    return binding.value === 'true';
                } else if (binding.datatype === 'http://www.w3.org/2001/XMLSchema#dateTime' ||
                    binding.datatype === 'http://www.w3.org/2001/XMLSchema#date') {
                    return new Date(binding.value).toISOString();
                }
                return binding.value;
            default:
                return binding.value;
        }
    }

    /**
     * Generate commonly used SPARQL prefixes for STZH linked data
     * @returns String of SPARQL prefix declarations
     */
    static getCommonPrefixes(): string {
        return `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
    `.trim();
    }
}