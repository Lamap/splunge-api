import { NextFunction, Response, Request } from 'express';

export async function checkLiveliness(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.send('Yes, I am alive.');
}
