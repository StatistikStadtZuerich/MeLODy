import axios from "axios";

export const sszDataFetcher = async <T>(url: string): Promise<T[]> => {
    try {
        const response = await axios.get(url);

        if (response.status === 200 && response.data.success === true) {
            const result = response.data.result;

            if (typeof result === 'object' && 'records' in result && Array.isArray(result.records)) {
                return result.records as T[];
            } else {
                throw new Error("Invalid data format: 'record' field is missing or not an array");
            }
        } else {
            throw new Error("Request failed or success field is false");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return []
    }
};