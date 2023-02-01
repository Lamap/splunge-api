import { NextFunction, Response } from 'express';
import { ISplungeRequest, ISplungeError } from '../interfaces';

export function errorHandler(err: ISplungeError, req: ISplungeRequest, res: Response, next: NextFunction): Response<void> | void {
    if (err) {
        return res.status(err.status || 500).send(err.message);
    }
    return next(req);
}
