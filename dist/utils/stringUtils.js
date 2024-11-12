"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toValidString = void 0;
const toValidString = (input) => input && input.toString().trim() !== "" && input.toString() !== '*' ? input.toString() : undefined;
exports.toValidString = toValidString;
