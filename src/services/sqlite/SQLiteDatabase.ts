import {DatabaseSync} from "node:sqlite";

const inMemoryDatabase = new DatabaseSync(":memory:");

// function initializeSchema() {
//     // Create datasets table
//     inMemoryDatabase.exec(`
//         CREATE TABLE IF NOT EXISTS datasets
//         (
//             id          TEXT PRIMARY KEY,
//             title       TEXT NOT NULL,
//             description TEXT,
//             schema      JSON NOT NULL
//         )
//     `);
//
//     // Create data storage table
//     inMemoryDatabase.exec(`
//         CREATE TABLE IF NOT EXISTS dataset_data
//         (
//             dataset_id TEXT,
//             data_id    TEXT,
//             content    JSON NOT NULL,
//             PRIMARY KEY (dataset_id, data_id),
//             FOREIGN KEY (dataset_id) REFERENCES datasets (id)
//         )
//     `);
//
//     // Create index for faster queries
//     inMemoryDatabase.exec(`
//         CREATE INDEX IF NOT EXISTS idx_dataset_data
//             ON dataset_data (dataset_id)
//     `);
// }
//
// try {
//     initializeSchema();
//     console.log('Database schema initialized successfully');
// } catch (error) {
//     console.error('Error initializing database schema:', error);
// }

export default inMemoryDatabase;