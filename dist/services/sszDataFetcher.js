"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sszDataFetcher = void 0;
const axios_1 = __importDefault(require("axios"));
const sszDataFetcher = async (url) => {
    try {
        const response = await axios_1.default.get(url);
        if (response.status === 200 && response.data.success === true) {
            const result = response.data.result;
            if (typeof result === 'object' && 'records' in result && Array.isArray(result.records)) {
                return result.records;
            }
            else {
                throw new Error("Invalid data format: 'record' field is missing or not an array");
            }
        }
        else {
            throw new Error("Request failed or success field is false");
        }
    }
    catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
exports.sszDataFetcher = sszDataFetcher;
