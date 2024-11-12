import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';


export const readCSV = async <T>(filePath: string): Promise<T[]> => new Promise((resolve, reject) => {
    const results: T[] = [];

    fs.createReadStream(path.resolve(filePath))
        .pipe(
            csv({
                separator: ',',
                headers: undefined,
                mapHeaders: ({header}) => header.trim().replace(/^"|"$/g, ''),
                mapValues: ({value}) => value.trim().replace(/^"|"$/g, '')
            })
        )
        .on('data', (data) => results.push(data as T))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
});

