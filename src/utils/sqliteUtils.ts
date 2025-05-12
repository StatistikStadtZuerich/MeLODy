import inMemoryDatabase from "../services/sqlite/SQLiteDatabase";
import {getRequestLogger} from "./logger";

/**
 * Gets all tables in the SQLite database along with their field information
 * @param requestId - The unique ID for the current request
 * @returns An object with table names as keys and array of field details as values
 */
export const getDatabaseSchema = (requestId?: string): Record<string, Array<{
    name: string;
    type: string;
    notnull: number;
    dflt_value: string | null;
    pk: number;
}>> => {
    const startTime = Date.now();
    const reqLogger = getRequestLogger(requestId);
    reqLogger.debug('Getting database schema');

    try {
        const tables = inMemoryDatabase
            .prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .all()
            .map((row: any) => row.name as string);

        reqLogger.debug('Retrieved database tables', {tableCount: tables.length});
        const schema: Record<string, Array<any>> = {};

        for (const tableName of tables) {
            const tableInfo = inMemoryDatabase
                .prepare(`PRAGMA table_info(${tableName})`)
                .all();

            schema[tableName] = tableInfo;
            reqLogger.debug('Retrieved table schema', {
                tableName,
                columnCount: tableInfo.length
            });
        }

        const processingTime = Date.now() - startTime;
        reqLogger.debug('Database schema retrieved successfully', {
            tableCount: tables.length,
            processingTimeMs: processingTime
        });

        return schema;
    } catch (error) {
        const processingTime = Date.now() - startTime;
        reqLogger.error('Error retrieving database schema', {
            error,
            processingTimeMs: processingTime
        });
        throw error;
    }
};

/**
 * Gets a more user-friendly representation of the database schema
 * @param requestId - The unique ID for the current request
 * @returns An object with table names as keys and field information as values
 */
export const getPrettyDatabaseSchema = (requestId?: string): Record<string, Record<string, {
    type: string;
    isPrimaryKey: boolean;
    isNullable: boolean;
    defaultValue: string | null;
}>> => {
    const startTime = Date.now();
    const reqLogger = getRequestLogger(requestId);
    reqLogger.debug('Getting pretty database schema');

    try {
        const rawSchema = getDatabaseSchema(requestId);
        const prettySchema: Record<string, Record<string, any>> = {};

        for (const [tableName, fields] of Object.entries(rawSchema)) {
            prettySchema[tableName] = {};

            for (const field of fields) {
                prettySchema[tableName][field.name] = field.type;
            }

            reqLogger.debug('Formatted table schema', {
                tableName,
                fieldCount: Object.keys(prettySchema[tableName]).length
            });
        }

        const processingTime = Date.now() - startTime;
        reqLogger.debug('Pretty database schema generated', {
            tableCount: Object.keys(prettySchema).length,
            processingTimeMs: processingTime
        });

        return prettySchema;
    } catch (error) {
        const processingTime = Date.now() - startTime;
        reqLogger.error('Error generating pretty database schema', {
            error,
            processingTimeMs: processingTime
        });
        throw error;
    }
};

export const castToDBType = (value: any) => {
    if (value === null || value === undefined) {
        return null;
    } else if (typeof value === "number" || !isNaN(Number(value))) {
        return Number(value);
    }
    return value as string;
}

/**
 * Infers SQLite type from a string value
 *
 * @param value String value to analyze
 * @returns Appropriate SQLite data type
 */
export const inferSQLiteType = (value: unknown): string => {
    if (typeof value === 'number' || !isNaN(Number(value))) {
        const num = parseFloat(value as string);
        if (Number.isInteger(num) && !(value as string).match(/^\d+\.0+$/)) {
            return 'INTEGER';
        } else {
            return 'REAL';
        }
    }

    return 'TEXT';
};


/**
 * Executes a given SQL query and returns the resulting data.
 *
 * @param query SQL query to execute
 * @param requestId The unique ID for the current request
 * @returns Result of the query as an array of records
 */
export const executeSQLiteQuery = (query: string, requestId?: string): any[] => {
    const startTime = Date.now();
    const reqLogger = getRequestLogger(requestId);
    reqLogger.debug(`Executing SQLite query`, {
        queryLength: query.length,
        query: query.substring(0, 200) + (query.length > 200 ? '...' : '') // Log first 200 chars for debugging
    });

    try {
        const result = inMemoryDatabase.prepare(query).all();
        const processingTime = Date.now() - startTime;

        reqLogger.debug(`SQLite query executed successfully`, {
            processingTimeMs: processingTime,
            resultCount: result.length
        });

        return result;
    } catch (error) {
        const processingTime = Date.now() - startTime;
        reqLogger.error(`Error executing SQLite query`, {
            error,
            processingTimeMs: processingTime,
            query: query.substring(0, 200) + (query.length > 200 ? '...' : '')
        });
        throw new Error("Failed to execute query");
    }
};
