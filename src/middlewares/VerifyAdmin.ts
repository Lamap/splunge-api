import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getUser } from '../controllers/user';
import { IUser } from 'splunge-common-lib';

export async function verifyAdmin(req: Request<unknown>, res: Response, next: NextFunction): Promise<Response<void> | void> {
    try {
        const token: string = req.cookies['jwt-token'];
        const jwtKey: string | undefined = process.env['JWT_KEY'];

        if (!token || !jwtKey) {
            return res.status(403).send('Failed to authenticate: invalid tokens');
        }
        const decoded: JwtPayload = jwt.verify(token, jwtKey) as JwtPayload;
        const user: IUser | null = await getUser(decoded.user.email);
        if (!user) {
            next({
                status: 403,
                message: 'Failed to authenticate: invalid tokens: invalid user',
            });
        }

        next();
    } catch (error) {
        console.log(error);
        next({
            status: 403,
            message: 'Failed to authenticate',
        });
    }
}
