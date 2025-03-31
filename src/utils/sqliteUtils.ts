import inMemoryDatabase from "../services/sqlite/SQLiteDatabase";

/**
 * Gets all tables in the SQLite database along with their field information
 * @returns An object with table names as keys and array of field details as values
 */
export const getDatabaseSchema = (): Record<string, Array<{
    name: string;
    type: string;
    notnull: number;
    dflt_value: string | null;
    pk: number;
}>> => {
    const tables = inMemoryDatabase
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all()
        .map((row: any) => row.name as string);

    const schema: Record<string, Array<any>> = {};

    for (const tableName of tables) {
        const tableInfo = inMemoryDatabase
            .prepare(`PRAGMA table_info(${tableName})`)
            .all();

        schema[tableName] = tableInfo;
    }

    return schema;
};

/**
 * Gets a more user-friendly representation of the database schema
 * @returns An object with table names as keys and field information as values
 */
export const getPrettyDatabaseSchema = (): Record<string, Record<string, {
    type: string;
    isPrimaryKey: boolean;
    isNullable: boolean;
    defaultValue: string | null;
}>> => {
    const rawSchema = getDatabaseSchema();
    const prettySchema: Record<string, Record<string, any>> = {};

    for (const [tableName, fields] of Object.entries(rawSchema)) {
        prettySchema[tableName] = {};

        for (const field of fields) {
            prettySchema[tableName][field.name] = field.type;
        }
    }

    return prettySchema;
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
 * @returns Result of the query as an array of records
 */
export const executeSQLiteQuery = (query: string): any[] => {
    try {
        return inMemoryDatabase.prepare(query).all();
    } catch (error) {
        console.error("Error executing query:", error);
        throw new Error("Failed to execute query");
    }
};
