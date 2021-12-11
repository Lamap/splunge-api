import { NextFunction, Response, Request } from 'express';

export function fetchImages(req: Request, res: Response, next: NextFunction): Response<string> {
    return res.status(200).send('fetchImages');
}
