import { NextFunction, Response, Request } from 'express';
import { ICreateOrReadUserRequest } from '../interfaces';
import { IUser, UserModel } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function createUser(req: ICreateOrReadUserRequest, res: Response, next: NextFunction): Promise<Response | void> {
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
        const users: IUser[] = await UserModel.find({}, { email: 1, password: 1 });
        return res.json(users);
    } catch (err) {
        return next({ message: 'Could not get users', status: 500 });
    }
}
export async function getUser(email: string, _id: string): Promise<IUser | null> {
    try {
        return await UserModel.findOne({ _id, email });
    } catch (error) {
        return null;
    }
}

export async function logUserIn(req: ICreateOrReadUserRequest, res: Response, next: NextFunction): Promise<void> {
    const { email, password } = req.body;
    const userFromDb: IUser | null = await UserModel.findOne({ email });
    if (!userFromDb) {
        return next({ status: 400, message: `No user with this email: ${email}.` });
    }
    if (!bcrypt.compareSync(password, userFromDb.password)) {
        return next({ status: 400, message: 'Wrong password' });
    }
    console.log(userFromDb);
    if (!process.env.jwtkey) {
        throw Error('jwt secret is not defined');
    }
    const jwtSecret: string = process.env.jwtkey;
    const token = jwt.sign({ _id: userFromDb._id, email: userFromDb.email }, jwtSecret, {
        expiresIn: '2 days',
    });
    res.send(token);
}
