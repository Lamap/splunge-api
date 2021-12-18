import { NextFunction, Response, Request } from 'express';
import {ISplungeRequest} from "../interfaces";

export function fetchImages(req: Request, res: Response, next: NextFunction): Response<string> {
    return res.status(200).send('fetchImages');
}
export function getImage(req: ISplungeRequest, res: Response, next: NextFunction): Response<string> | void {
    if (req.params.id?.length !== 6) {
        return next({
            message: 'wrong id, bad request',
            status: 400,
        });
    }
    return res.status(200).send('getimage');
}
