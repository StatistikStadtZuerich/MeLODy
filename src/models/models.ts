export interface SourceConfig {
    type: 'sparql' | 'rest';
    endpoint: string;
    defaultGraphUri?: string;
    format?: string;
    method?: string;
    headers?: Record<string, string>;
    timeout?: number;
}

export interface SourceConfigs {
    [key: string]: SourceConfig;
}

export interface ResponseFormatterOptions {
    maxResultItems?: number;
    maxProperties?: number;
    maxStringLength?: number;
}

export interface TableResponse {
    headers: string[];
    rows: any[][];
}

export interface SparqlBinding {
    type: string;
    value: string;
    datatype?: string;
    'xml:lang'?: string;
}

export interface SparqlBindingSet {
    [key: string]: SparqlBinding;
}

export interface SparqlResults {
    head: {
        vars: string[];
        link?: string[];
    };
    results: {
        bindings: SparqlBindingSet[];
    };
}


export type FormatType = 'json' | 'table' | 'text' | 'csv';