import { Request } from 'express';
import { IUser } from './models/User';
import { IPointCreateRequestBody } from 'splunge-common-lib';
interface ISplungeError {
    readonly message: string;
    readonly status: number;
}
export interface ISplungeRequest extends Request {
    readonly error?: ISplungeError;
}

export interface IGetPointsBySphereRectBody {
    locationRect: ILocationRect;
}
export interface IPointCreateRequest extends ISplungeRequest {
    readonly body: IPointCreateRequestBody;
}
export interface IAttachPointToImageRequestParams {
    readonly pointId: string;
    readonly imageId: string;
}
export interface IAttachPointToImageRequest extends Request<IAttachPointToImageRequestParams> {
    readonly params: IAttachPointToImageRequestParams;
}
export interface IFetchImagesByRectRequestBody extends Request {
    readonly locationRect: ILocationRect;
}
export interface IFetchImagesByRectRequest extends Request {
    readonly body: IFetchImagesByRectRequestBody;
}
export interface IGetPointsBySphereRectRequest extends ISplungeRequest {
    readonly body: IGetPointsBySphereRectBody;
}
export interface ILocationRect {
    readonly maxLon: number;
    readonly minLon: number;
    readonly minLat: number;
    readonly maxLat: number;
}

export interface ICreateOrReadUserRequest {
    readonly body: IUser;
}
