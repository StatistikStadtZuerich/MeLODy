// services/QueryProcessor.ts
import {DatabaseSync} from 'node:sqlite';
import inMemoryDatabase from "./SQLiteDatabase";
import {DataQuery, DatasetDefinition} from "../../models/DatasetDefinition";

// Prepare common statements
const getDataSetsStmt = inMemoryDatabase.prepare(`
    SELECT id, title, description, schema
    FROM datasets
`);

class QueryProcessor {
    private db: DatabaseSync = inMemoryDatabase;
    private initialized: boolean = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
    }

    /**
     * Get all available datasets
     */
    async getDatasets(): Promise<DatasetDefinition[]> {
        await this.initialize();

        const datasets = getDataSetsStmt.all();

        return datasets.map((dataset: any) => ({
            id: dataset.id,
            title: dataset.title,
            description: dataset.description,
            ...JSON.parse(dataset.schema)
        }));
    }

    /**
     * Process a query against a dataset
     */
    async query(query: DataQuery): Promise<any[]> {
        await this.initialize();

        const {datasetId, filters = {}, sort, limit = 100, offset = 0} = query;

        // Start building SQL query
        let sql = `SELECT content
                   FROM dataset_data
                   WHERE dataset_id = ?`;
        const params: any[] = [datasetId];

        // Add filter conditions with enhanced multi-selection support
        if (Object.keys(filters).length > 0) {
            const filterClauses = this.buildFilterClauses(filters);
            sql += ` AND ${filterClauses.clause}`;
            params.push(...filterClauses.params);
        }

        // Add sorting
        if (sort) {
            if (Array.isArray(sort)) {
                // Handle multiple sort fields
                const sortClauses = sort.map(sortItem => {
                    const field = sortItem.field || 'id';
                    const direction = (sortItem.direction || 'asc').toUpperCase();
                    return `json_extract(content, '$.${field}') ${direction}`;
                });
                sql += ` ORDER BY ${sortClauses.join(', ')}`;
            } else {
                // Handle single sort field
                const field = sort.field || 'id';
                const direction = (sort.direction || 'asc').toUpperCase();
                sql += ` ORDER BY json_extract(content, '$.${field}') ${direction}`;
            }
        }

        // Add pagination
        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Create a dynamic prepared statement for this specific query
        const stmt = this.db.prepare(sql);

        // Execute the query with parameters
        const rows = stmt.all(...params);

        // Parse JSON results
        return rows.map((row: any) => JSON.parse(row.content));
    }

    /**
     * Build filter clauses with enhanced multi-selection support
     */
    private buildFilterClauses(filters: Record<string, any>): { clause: string; params: any[] } {
        const clauses: string[] = [];
        const params: any[] = [];

        for (const [field, filter] of Object.entries(filters)) {
            // Handle different filter types
            if (filter === null || filter === undefined) {
                clauses.push(`json_extract(content, '$.${field}') IS NULL`);
            } else if (typeof filter === 'object') {
                if (Array.isArray(filter)) {
                    // List filter (IN operator)
                    if (filter.length > 0) {
                        const placeholders = filter.map(() => '?').join(', ');
                        clauses.push(`json_extract(content, '$.${field}') IN (${placeholders})`);
                        params.push(...filter);
                    }
                } else if ('min' in filter || 'max' in filter) {
                    // Range filter
                    const rangeClauses = [];

                    if ('min' in filter && filter.min !== null && filter.min !== undefined) {
                        rangeClauses.push(`json_extract(content, '$.${field}') >= ?`);
                        params.push(filter.min);
                    }

                    if ('max' in filter && filter.max !== null && filter.max !== undefined) {
                        rangeClauses.push(`json_extract(content, '$.${field}') <= ?`);
                        params.push(filter.max);
                    }

                    if (rangeClauses.length > 0) {
                        clauses.push(`(${rangeClauses.join(' AND ')})`);
                    }
                } else if ('values' in filter && Array.isArray(filter.values)) {
                    // Multi-select filter with explicit values property
                    if (filter.values.length > 0) {
                        const placeholders = filter.values.map(() => '?').join(', ');
                        clauses.push(`json_extract(content, '$.${field}') IN (${placeholders})`);
                        params.push(...filter.values);
                    }
                } else if ('eq' in filter) {
                    // Equality operator
                    clauses.push(`json_extract(content, '$.${field}') = ?`);
                    params.push(filter.eq);
                } else if ('neq' in filter) {
                    // Not equal operator
                    clauses.push(`json_extract(content, '$.${field}') != ?`);
                    params.push(filter.neq);
                } else if ('gt' in filter) {
                    // Greater than operator
                    clauses.push(`json_extract(content, '$.${field}') > ?`);
                    params.push(filter.gt);
                } else if ('gte' in filter) {
                    // Greater than or equal operator
                    clauses.push(`json_extract(content, '$.${field}') >= ?`);
                    params.push(filter.gte);
                } else if ('lt' in filter) {
                    // Less than operator
                    clauses.push(`json_extract(content, '$.${field}') < ?`);
                    params.push(filter.lt);
                } else if ('lte' in filter) {
                    // Less than or equal operator
                    clauses.push(`json_extract(content, '$.${field}') <= ?`);
                    params.push(filter.lte);
                } else if ('contains' in filter) {
                    // Contains (LIKE) operator
                    clauses.push(`json_extract(content, '$.${field}') LIKE ?`);
                    params.push(`%${filter.contains}%`);
                } else if ('startsWith' in filter) {
                    // Starts with operator
                    clauses.push(`json_extract(content, '$.${field}') LIKE ?`);
                    params.push(`${filter.startsWith}%`);
                } else if ('endsWith' in filter) {
                    // Ends with operator
                    clauses.push(`json_extract(content, '$.${field}') LIKE ?`);
                    params.push(`%${filter.endsWith}`);
                } else if ('between' in filter && Array.isArray(filter.between) && filter.between.length === 2) {
                    // Between operator
                    clauses.push(`json_extract(content, '$.${field}') BETWEEN ? AND ?`);
                    params.push(filter.between[0], filter.between[1]);
                } else if (Object.keys(filter).length === 0) {
                    // Empty object, do nothing
                } else {
                    // Unknown filter type, try JSON equality
                    clauses.push(`json_extract(content, '$.${field}') = ?`);
                    params.push(JSON.stringify(filter));
                }
            } else {
                // Simple equality filter
                clauses.push(`json_extract(content, '$.${field}') = ?`);
                params.push(filter);
            }
        }

        return {
            clause: clauses.length > 0 ? clauses.join(' AND ') : '1=1',
            params
        };
    }
}

// Export singleton
const queryProcessor = new QueryProcessor();
export default queryProcessor;