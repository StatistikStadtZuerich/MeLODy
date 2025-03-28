import {Readable} from 'stream';
import csv from 'csv-parser';
import inMemoryDatabase from '../services/sqlite/SQLiteDatabase';
import {castToDBType, inferSQLiteType} from "./sqliteUtils";


const csvParserOptions = {
    separator: ',',
    headers: true,
    mapHeaders: ({header}: { header: string }) => header.trim().replace(/^"|"$/g, ''),
    mapValues: ({value}: { value: string }) => value.trim().replace(/^"|"$/g, '')
};

/**
 * Creates a new table in SQLite based on the headers and data types from the CSV
 *
 * @param tableName The name of the table to create
 * @param headerRow The header row
 * @param dataRow A possible data row
 * @param primaryKey Optional column name to use as primary key
 * @returns void
 */
const createTableFromCSVHeaders = (
    tableName: string,
    headerRow: Record<string, unknown>,
    dataRow?: Record<string, unknown>,
    primaryKey?: string
): void => {
    const columns = Object.entries(headerRow).map(([key, value]) => {
        let columnType = 'TEXT';
        if (dataRow && dataRow[key]) {
            columnType = inferSQLiteType(dataRow[key]);
        }

        if (value === primaryKey) {
            return `"${value}" ${columnType} PRIMARY KEY`;
        }
        return `"${value}" ${columnType}`;
    }).join(", ");

    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS "${tableName}"
        (
            ${columns}
        )
    `;

    try {
        inMemoryDatabase.exec(createTableSQL);
    } catch (error) {
        console.error(`Error creating table ${tableName}:`, error);
        throw error;
    }
};


/**
 * Stores a CSV string into a SQLite table by directly streaming the data
 *
 * @param csvString The CSV string to parse and store
 * @param tableName The name of the SQLite table to create/use
 * @param primaryKey Optional column to use as primary key
 * @param dropExisting Whether to drop the existing table before creating a new one (default: false)
 * @returns A promise that resolves to the number of rows inserted
 */
export const storeCSVInSQLite = (
    csvString: string,
    tableName: string,
    primaryKey?: string,
    dropExisting: boolean = false
): Promise<number> =>
    new Promise((resolve, reject) => {
        try {
            const stringStream = Readable.from(csvString);
            let rowsInserted = 0;
            let insertStatement: any;
            let firstRow = true;
            let headerRow: Record<string, unknown>;
            let createdTable = false;

            if (dropExisting) {
                inMemoryDatabase.exec(`DROP TABLE IF EXISTS "${tableName}"`);
            }

            inMemoryDatabase.exec('BEGIN TRANSACTION');

            stringStream
                .pipe(csv(csvParserOptions))
                .on('data', (row) => {
                    if (firstRow) {
                        headerRow = row;
                        firstRow = false;
                    } else {
                        if (!createdTable) {

                            createTableFromCSVHeaders(tableName, headerRow, row, primaryKey);
                            const headers = Object.values(headerRow) as string[];

                            const columns = headers.map(h => `"${h}"`).join(', ');
                            const placeholders = headers.map(() => '?').join(', ');
                            const insertSQL = `INSERT INTO "${tableName}" (${columns})
                                               VALUES (${placeholders})`;
                            insertStatement = inMemoryDatabase.prepare(insertSQL);

                            createdTable = true;
                        }
                        const values = Object.values(row).map(item => castToDBType(item));

                        try {
                            insertStatement.run(...values);
                            rowsInserted++;
                        } catch (error) {
                            console.error('Error inserting row:', error);
                            reject(error);
                        }
                    }
                })
                .on('end', () => {
                    try {
                        inMemoryDatabase.exec('COMMIT');
                        resolve(rowsInserted);
                    } catch (error) {
                        console.error('Error committing transaction:', error);
                        reject(error);
                    }
                })
        } catch (error) {
            console.error('Error storing CSV in SQLite:', error);
            reject(error);
        }
    });
