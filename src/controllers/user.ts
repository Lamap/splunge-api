import { NextFunction, Response, Request } from 'express';
import { ICreateUserRequest } from '../interfaces';
import { IUser, UserModel } from '../models/User';

export async function createUser(req: ICreateUserRequest, res: Response, next: NextFunction): Promise<Response | void> {
    const { email, password } = req.body;
    if (!email) {
        return next({ status: 400, message: 'Not valid email' });
    }
    if (!password) {
        return next({ status: 400, message: 'Not valid password' });
    }
    try {
        const userExistsAlready: IUser | null = await UserModel.findOne({ email });
        if (userExistsAlready) {
            return next({ status: 400, message: 'This user email already exists.' });
        }
        await UserModel.create(req.body);
        return res.send('ok');
    } catch (err) {
        return next({
            status: 500,
            message: err,
        });
    }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<Response<IUser[]> | void> {
    try {
        const users: IUser[] = await UserModel.find({}, { email: 1 });
        return res.json(users);
    } catch (err) {
        return next({ message: 'Could not get users', status: 500 });
    }
}
