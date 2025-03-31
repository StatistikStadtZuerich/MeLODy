import fs from 'fs';
import path from 'path';
import yauzl from 'yauzl';

/**
 * Checks if a file is a ZIP file by examining its magic number (file signature)
 * @param filePath Path to the file to check
 * @returns A promise that resolves to true if the file is a ZIP, false otherwise
 */
export const isZipFile = async (filePath: string): Promise<boolean> => {
    try {
        const fd = await fs.promises.open(filePath, 'r');
        const buffer = Buffer.alloc(4);
        await fd.read(buffer, 0, 4, 0);
        await fd.close();

        return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
    } catch (error) {
        console.error(`Error checking if file is a ZIP: ${error}`);
        return false;
    }
};

/**
 * Extracts a CSV file from a ZIP archive
 * @param zipFilePath Path to the ZIP file
 * @returns A promise that resolves to the content of the first CSV file in the ZIP
 */
export const extractCSVFromZip = (zipFilePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        yauzl.open(zipFilePath, {lazyEntries: true}, (err, zipfile) => {
            if (err || !zipfile) {
                return reject(err || new Error('Failed to open ZIP file'));
            }

            let csvContent: string | null = null;

            zipfile.on('entry', (entry) => {
                if (entry.fileName.toLowerCase().endsWith('.csv')) {
                    zipfile.openReadStream(entry, (err, readStream) => {
                        if (err || !readStream) {
                            zipfile.close();
                            return reject(err || new Error('Failed to open read stream for ZIP entry'));
                        }

                        const chunks: Buffer[] = [];
                        readStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                        readStream.on('end', () => {
                            csvContent = Buffer.concat(chunks).toString('utf8');
                            zipfile.close();
                            resolve(csvContent.replace(/;/g, ','));
                        });
                        readStream.on('error', (err) => {
                            zipfile.close();
                            reject(err);
                        });
                    });
                } else {
                    zipfile.readEntry();
                }
            });

            zipfile.on('end', () => {
                if (csvContent === null) {
                    reject(new Error('No CSV file found in the ZIP archive'));
                }
            });

            zipfile.on('error', (err) => {
                reject(err);
            });

            zipfile.readEntry();
        });
    });
};

/**
 * Reads a file from the filesystem, checking if it's a ZIP file first.
 * If it's a ZIP file, it decompresses it and returns the content of the first CSV file.
 * If it's a CSV file, it reads it directly.
 * @param filePath Path to the file
 * @returns A promise that resolves to the content of the file as a string
 */
export const readFileWithTypeCheck = async (filePath: string): Promise<string> => {
    try {
        const isZip = await isZipFile(filePath);

        if (isZip) {
            console.log(`File ${filePath} is a ZIP file. Decompressing...`);
            return await extractCSVFromZip(filePath);
        } else {
            console.log(`File ${filePath} appears to be a CSV file. Reading directly...`);
            return await readCSVAsString(filePath);
        }
    } catch (error) {
        console.error(`Error processing file ${filePath}: ${error}`);
        throw error;
    }
};

/**
 * Reads a CSV file from the filesystem and returns its content as a string
 * @param filePath Path to the CSV file
 * @returns A promise that resolves to the content of the CSV file as a string
 */
export const readCSVAsString = async (filePath: string): Promise<string> => {
    const content = await fs.promises.readFile(path.resolve(filePath), 'utf8');
    return content.replace(/;/g, ',');
};