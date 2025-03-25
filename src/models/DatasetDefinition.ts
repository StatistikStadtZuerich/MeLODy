// models/DatasetDefinition.ts

/**
 * Represents a field within a dataset
 */
export interface DatasetField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    description: string;
}

/**
 * Filter types available for each field
 */
export type FilterType = 'exact' | 'multi-select';

/**
 * Represents a filter that can be applied to a dataset
 */
export interface DatasetFilter {
    field: string;
    type: FilterType;
}

/**
 * Basic dataset definition structure
 */
export interface DatasetDefinition {
    id: string;
    title: string;
    description: string;
    fields: DatasetField[];
    filters: DatasetFilter[];
    multiSelectOptions?: Record<string, string[]>;  // Options for multi-select fields
}

/**
 * Array of dataset definitions
 */
export type DatasetDefinitions = DatasetDefinition[];

/**
 * Query structure for dataset queries
 */
export interface DataQuery {
    datasetId: string;
    filters?: {
        [key: string]: any;  // Can be a value or array for multi-select
    };
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    limit?: number;
    offset?: number;
}

export interface DatasetDefinitionWithSparqlQuery {
    definition: DatasetDefinition;
    sparqlQuery: string;
}