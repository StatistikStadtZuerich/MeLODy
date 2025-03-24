import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import {Readable, Stream} from 'stream';

/**
 * CSV parser configuration options
 */
const csvParserOptions = {
    separator: ',',
    headers: undefined,
    mapHeaders: ({header}: { header: string }) => header.trim().replace(/^"|"$/g, ''),
    mapValues: ({value}: { value: string }) => value.trim().replace(/^"|"$/g, '')
};

/**
 * Core function to parse CSV data from any readable stream
 * @param stream The readable stream containing CSV data
 * @returns A promise that resolves to an array of objects of type T
 */
const parseCSVFromStream = <T>(stream: Stream): Promise<T[]> => new Promise((resolve, reject) => {
    const results: T[] = [];

    stream
        .pipe(csv(csvParserOptions))
        .on('data', (data) => results.push(data as T))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
});

/**
 * Reads a CSV file from filesystem and converts it to an array of objects
 * @param filePath Path to the CSV file
 * @returns A promise that resolves to an array of objects of type T
 */
export const readCSV = async <T>(filePath: string): Promise<T[]> => {
    const fileStream = fs.createReadStream(path.resolve(filePath));
    return parseCSVFromStream<T>(fileStream);
};

/**
 * Parses a CSV string received from an API and converts it to an array of objects
 * @param csvString The CSV string to parse
 * @returns A promise that resolves to an array of objects of type T
 */
export const parseCSVFromAPI = async <T>(csvString: string): Promise<T[]> => {
    const stringStream = Readable.from(csvString);
    return parseCSVFromStream<T>(stringStream);
};