export class BaseError extends Error {
    public code: string;
    public statusCode: number;

    constructor(message: string, code: string, statusCode: number) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, BaseError.prototype);
    }
}

export class QueryError extends BaseError {
    constructor(message: string, code = 'QUERY_ERROR', statusCode = 400) {
        super(message, code, statusCode);

        Object.setPrototypeOf(this, QueryError.prototype);
    }
}

export class LinkedDataError extends BaseError {
    constructor(message: string, code = 'LINKED_DATA_ERROR', statusCode = 500) {
        super(message, code, statusCode);

        Object.setPrototypeOf(this, LinkedDataError.prototype);
    }
}

export class FormatterError extends BaseError {
    constructor(message: string, code = 'FORMATTER_ERROR', statusCode = 500) {
        super(message, code, statusCode);

        Object.setPrototypeOf(this, FormatterError.prototype);
    }
}