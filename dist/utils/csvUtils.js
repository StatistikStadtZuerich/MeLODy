"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCSV = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const readCSV = async (filePath) => new Promise((resolve, reject) => {
    const results = [];
    fs_1.default.createReadStream(path_1.default.resolve(filePath))
        .pipe((0, csv_parser_1.default)({
        separator: ',',
        headers: undefined,
        mapHeaders: ({ header }) => header.trim().replace(/^"|"$/g, ''),
        mapValues: ({ value }) => value.trim().replace(/^"|"$/g, '')
    }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
});
exports.readCSV = readCSV;
