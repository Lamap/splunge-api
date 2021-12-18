import { NextFunction, Response, Request } from 'express';
import { ISplungeRequest } from '../interfaces';

export function errorHandler(err: any, req: ISplungeRequest, res: Response, next: NextFunction) {
    if (err) {
        return res.status(500).send(err.message);
    }
    return next(req);
}
