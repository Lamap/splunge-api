import { NextFunction, Response, Request } from 'express';
import { ICreateUserRequest } from '../interfaces';
import { IUser, UserModel } from '../models/User';

export async function createUser(req: ICreateUserRequest, res: Response, next: NextFunction): Promise<Response | void> {
    if (!req.body.email) {
        return next({ status: 400, message: 'Not valid email' });
    }
    if (!req.body.password) {
        return next({ status: 400, message: 'Not valid password' });
    }
    try {
        await UserModel.create(req.body);
        return res.send('ok');
    } catch (err) {
        return next({
            status: 500,
            message: 'Failed to create user',
        });
    }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<Response<IUser[]> | void> {
    try {
        const users: IUser[] = await UserModel.find({});
        return res.json(users);
    } catch (err) {
        return next({ message: 'Could not get users', status: 500 });
    }
}
