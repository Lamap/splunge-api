import { Request } from 'express';
import { IUser } from './models/User';
import { IPointCreateRequestBody, ISpgImage, ISpgPoint } from 'splunge-common-lib';
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
interface IParamRequestWithId {
    readonly id: string;
}
export interface IDeleteImageRequest extends Request<IParamRequestWithId> {
    readonly params: IParamRequestWithId;
}

export interface IDeletePointRequest extends Request<IParamRequestWithId> {
    readonly params: IParamRequestWithId;
}

export interface IImageUpdateRequest extends Request<IParamRequestWithId> {
    readonly params: IParamRequestWithId;
    readonly body: ISpgImage;
}

export interface IPointUpdateRequest extends Request<IParamRequestWithId> {
    readonly params: IParamRequestWithId;
    readonly body: ISpgPoint;
}

export interface IDetachPointFromImageRequest extends Request<IParamRequestWithId> {
    readonly params: IParamRequestWithId;
}

interface IParamsWithImageAndPointId {
    readonly imageId: string;
    readonly pointId: string;
}
export interface IAttachPointToImageRequest extends Request<IParamsWithImageAndPointId> {
    readonly params: IParamsWithImageAndPointId;
}
