import {DatasetIdWithQuery} from "../models/DatasetIdWithQuery";
import {getAllDatasets} from "../models/datasetDefinitions/allDatasets";

export const compressJsonWithIdMapping = (jsonData: Record<string, any>[]): {
    idPerName: Record<string, number>,
    data: Record<number, any>[]
} => {
    const idPerName: Record<string, number> = {};
    let nextId = 1;

    jsonData.forEach(item => {
        Object.keys(item).forEach(propName => {
            if (!idPerName[propName]) {
                idPerName[propName] = nextId++;
            }
        });
    });

    const compressedData = jsonData.map(item => {
        const compressedItem: Record<number, any> = {};
        Object.entries(item).forEach(([propName, value]) => {
            compressedItem[idPerName[propName]] = value;
        });
        return compressedItem;
    });

    return {
        idPerName,
        data: compressedData
    };
};

export const extractTablesFromQuery = (query: string): DatasetIdWithQuery[] => {
    const tablePattern = /(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)/gi;
    const tableMatches = [...query.matchAll(tablePattern)];

    const tableNames = new Set<string>();
    for (const match of tableMatches) {
        if (match[1]) {
            tableNames.add(match[1].trim());
        }
    }

    return getAllDatasets().filter(dataset =>
        tableNames.has(dataset.id)
    );
};
