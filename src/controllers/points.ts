import { NextFunction, Response, Request } from 'express';

export function fetchPoints(req: Request, res: Response, next: NextFunction): Response<string> {
    return res.status(200).send('fetchPoints');
}
