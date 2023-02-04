import { NextFunction, Response, Request } from 'express';
import { ICreateUserRequest, ILogUserInRequest } from '../interfaces';
import { UserModel } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser, IUserMetadata, UserRole } from 'splunge-common-lib';
import { IUserBase } from 'splunge-common-lib/lib/interfaces/IUserBase';

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
        const metadata: IUserMetadata = {
            lastActed: new Date(),
            lastLoggedIn: new Date(),
            createdOn: new Date(),
        };
        await UserModel.create({
            ...req.body,
            metadata,
            role: UserRole.ADMIN,
        });
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
export async function getUser(email: string): Promise<IUser | null> {
    try {
        return await UserModel.findOne({ email });
    } catch (error) {
        return null;
    }
}

export async function logUserIn(req: ILogUserInRequest, res: Response<IUserBase>, next: NextFunction): Promise<void> {
    const { email, password } = req.body;
    const userFromDb: IUser | null = await UserModel.findOne({ email });
    if (!userFromDb) {
        return next({ status: 400, message: `No user with this email: ${email}.` });
    }
    if (!bcrypt.compareSync(password, userFromDb.password)) {
        return next({ status: 400, message: 'Wrong password' });
    }
    if (!process.env.jwtkey) {
        throw Error('jwt secret is not defined');
    }
    const jwtSecret: string = process.env.jwtkey;

    const token = jwt.sign({ user: { email: userFromDb.email, role: userFromDb.role, sameSite: false } }, jwtSecret, {
        expiresIn: '2 days',
    });
    res.cookie('jwt-token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: false });

    res.send({
        email: userFromDb.email,
        metadata: userFromDb.metadata,
        role: userFromDb.role,
    });
}
export async function logUserOut(req: Request, res: Response<string>, next: NextFunction): Promise<void> {
    console.log(req.cookies);
    res.cookie('jwt-token', null);
    res.send('logged out');
}
