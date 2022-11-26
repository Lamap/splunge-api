import { NextFunction, Response, Request } from 'express';
import { ISplungeRequest } from '../interfaces';

export function errorHandler(err: any, req: ISplungeRequest, res: Response, next: NextFunction): Response<void> | void {
    if (err) {
        console.log(err);
        return res.status(err.status || 500).send(err.message);
    }
    return next(req);
}
