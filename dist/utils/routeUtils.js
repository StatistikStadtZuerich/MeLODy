"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataResponse = exports.extractLimitAndOffset = exports.applyPagination = void 0;
const numberUtils_1 = require("./numberUtils");
const applyPagination = (req, data) => {
    const { offset, limit = 100 } = (0, exports.extractLimitAndOffset)(req);
    const start = offset || 0;
    const end = start + (limit || data.length);
    return data.slice(start, end);
};
exports.applyPagination = applyPagination;
const extractLimitAndOffset = (req) => {
    const { offset, limit } = req.query;
    return {
        limit: (0, numberUtils_1.intOrUndefined)(limit),
        offset: (0, numberUtils_1.intOrUndefined)(offset),
    };
};
exports.extractLimitAndOffset = extractLimitAndOffset;
const dataResponse = (res, data, total) => res.status(200).json({
    total,
    returned: data.length,
    data,
});
exports.dataResponse = dataResponse;
