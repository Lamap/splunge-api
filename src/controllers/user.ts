import { NextFunction, Response, Request } from 'express';
import {ICreateUserRequest} from "../interfaces";
import {UserModel} from "../models/User";

export async function createUser(req: ICreateUserRequest, res: Response, next: NextFunction): Promise<Response | void> {
    if (!req.body.email) {
        return next({status: 400, message: 'Not valid email'});
    }
    if (!req.body.password) {
        return next({status: 400, message: 'Not valid password'});
    }
    try {
        return UserModel.create(req.body);
    } catch (err) {
        return next({
            status: 500,
            message: 'Failed to create user',
        })
    }
}