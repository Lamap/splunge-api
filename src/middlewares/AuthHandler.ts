import { NextFunction, Request, Response } from 'express';
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import { IUser } from '../models/User';
import { getUser } from '../controllers/user';

export async function AuthHandler(req: Request, res: Response, next: NextFunction): Promise<Response<void> | void> {
    const { headers } = req;
    try {
        const token = headers.authorization?.replace('Bearer ', '');
        const jwtKey: string | undefined = process.env['jwtkey'];
        if (!token || !jwtKey) {
            return res.status(403).send('Failed to authenticate: invalid tokens');
        }
        const decoded: JwtPayload = jwt.verify(token, jwtKey) as JwtPayload;
        const user: IUser | null = await getUser(decoded.email, decoded._id);
        if (!user) {
            next({
                status: 403,
                message: 'Failed to authenticate: invalid tokens: invalid user',
            });
        }

        next();
    } catch (error) {
        next({
            status: 403,
            message: 'Failed to authenticate',
        });
    }
}
