import { NextFunction, Response, Request } from 'express';
interface ISplungeError {
    message: string;
    status: number;
}
export interface ISplungeRequest extends Request {
    error?: ISplungeError;
}
