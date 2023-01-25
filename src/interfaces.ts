import { Request } from 'express';
import {
    ICreateImageRequestBody,
    ICreateUserRequestBody,
    IGetPointsByBoundsRequestBody,
    ILoginUserRequestBody,
    IPointCreateRequestBody,
    ISpgImage,
    ISpgPoint,
} from 'splunge-common-lib';
interface ISplungeError {
    readonly message: string;
    readonly status: number;
}
export interface ISplungeRequest extends Request {
    readonly error?: ISplungeError;
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
export interface IGetPointsByLatLngBoundsRequest extends Request {
    readonly body: IGetPointsByBoundsRequestBody;
}
export interface ILocationRect {
    readonly maxLon: number;
    readonly minLon: number;
    readonly minLat: number;
    readonly maxLat: number;
}

export interface ICreateUserRequest extends Request<ICreateUserRequestBody> {
    readonly body: ICreateUserRequestBody;
}
export interface ILogUserInRequest extends Request<ILoginUserRequestBody> {
    readonly body: ILoginUserRequestBody;
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

export interface ICreateImageRequest extends Request<ICreateImageRequestBody> {
    body: ICreateImageRequestBody;
}

export interface IPointOfImageRequest extends Request<IParamRequestWithId> {
    params: IParamRequestWithId;
}
