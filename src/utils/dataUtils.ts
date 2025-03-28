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
