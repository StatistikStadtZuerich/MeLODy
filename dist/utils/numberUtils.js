"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = exports.intOrUndefined = exports.numberOrUndefined = void 0;
const numberOrUndefined = (num) => {
    if (typeof num === 'number') {
        return num;
    }
    else if (!isNaN(Number(num))) {
        return Number(num);
    }
    return undefined;
};
exports.numberOrUndefined = numberOrUndefined;
const intOrUndefined = (num) => {
    if (typeof num === 'number' || !isNaN(Number(num))) {
        return parseInt(String(num), 10);
    }
    return undefined;
};
exports.intOrUndefined = intOrUndefined;
const isNumber = (value) => typeof value === 'number' || !isNaN(Number(value));
exports.isNumber = isNumber;
