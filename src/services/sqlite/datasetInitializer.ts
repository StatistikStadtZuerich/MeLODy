import inMemoryDatabase from './SQLiteDatabase';
import {DatasetDefinitions} from "../../models/DatasetDefinition";

const insertDatasetStmt = inMemoryDatabase.prepare(`
    INSERT OR
    REPLACE
    INTO datasets (id, title, description, schema)
    VALUES (?, ?, ?, ?)
`);

async function initializeDatasets(datasets: DatasetDefinitions): Promise<string[]> {
    console.log('Initializing dataset definitions...');
    let initiatedDatasets: string[] = [];
    try {
        const getExistingDatasetsStmt = inMemoryDatabase.prepare(`
            SELECT id
            FROM datasets
        `);
        const existingDatasets = getExistingDatasetsStmt.all().map((row: any) => row?.id);

        for (const dataset of datasets) {
            try {
                if (!existingDatasets.includes(dataset.id)) {
                    insertDatasetStmt.run(
                        dataset.id,
                        dataset.title,
                        dataset.description,
                        JSON.stringify(dataset)
                    );
                    console.log(`Registered new dataset: ${dataset.id}`);
                } else {
                    console.log(`Dataset already exists: ${dataset.id}`);
                }
                initiatedDatasets.push(dataset.id);
            } catch (error) {
                console.error(`Error initializing dataset ${dataset.id}:`, error);
            }
        }

        console.log('Datasets initialization completed');
    } catch (error) {
        console.error('Error initializing datasets:', error);
    }
    return initiatedDatasets;
}

async function storeDataset(datasetId: string, data: any[]): Promise<number> {
    try {
        inMemoryDatabase.exec('BEGIN TRANSACTION');

        const clearDataStmt = inMemoryDatabase.prepare(`
            DELETE
            FROM dataset_data
            WHERE dataset_id = ?
        `);
        clearDataStmt.run(datasetId);

        const insertDataStmt = inMemoryDatabase.prepare(`
            INSERT INTO dataset_data (dataset_id, data_id, content)
            VALUES (?, ?, ?)
        `);

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const id = item.id || `${datasetId}_${i}`;
            insertDataStmt.run(datasetId, id, JSON.stringify(item));
        }

        inMemoryDatabase.exec('COMMIT');
        return data.length;
    } catch (error) {
        inMemoryDatabase.exec('ROLLBACK');
        console.error(`Error storing data for dataset ${datasetId}:`, error);
        throw error;
    }
}

export {initializeDatasets, storeDataset};