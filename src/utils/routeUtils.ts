import {Request, Response} from 'express';
import {intOrUndefined} from "./numberUtils";

export const applyPagination = <T>(req: Request, data: T[]) => {
    const {offset, limit = 100} = extractLimitAndOffset(req);
    const start = offset || 0;
    const end = start + (limit || data.length);

    return data.slice(start, end);
}

export const extractLimitAndOffset = (req: Request): { limit: number | undefined; offset: number | undefined } => {
    const {offset, limit} = req.query;
    return {
        limit: intOrUndefined(limit),
        offset: intOrUndefined(offset),
    }
}

export const dataResponse = <T>(res: Response, data: T[], total: number) =>
    res.status(200).json({
        total,
        returned: data.length,
        data,
    });

