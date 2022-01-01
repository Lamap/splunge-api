import { NextFunction, Response, Request } from 'express';
import {ISplungeRequest} from '../interfaces';
import ImageModel, { IImage } from '../models/Image';

interface IImageCreateRequest extends ISplungeRequest {
    readonly body: IImage;
}

export async function fetchImages(req: Request, res: Response, next: NextFunction): Promise<Response<IImage[] | string>> {
    const images: IImage[] = await ImageModel.find({});
    return res.status(200).json(images);
}
export function getImage(req: ISplungeRequest, res: Response, next: NextFunction): Response<string> | void {
    if (req.params.id?.length !== 6) {
        return next({
            message: 'wrong id, bad request',
            status: 400,
        });
    }
    return res.status(200).send('getimage');
}

export async function createImage(req: IImageCreateRequest, res: Response, next: NextFunction): Promise<Response<void> | void> {
    if (!req.body.url) {
        return next({message: 'required property is missing "url"', status: 400});
    }
    console.log(req.file);
    const newImage: any = new ImageModel({
        title: req.body?.title,
        url: req.body?.url,
    });
    return (await newImage.save()
        .then(() => {
            return res.status(200).send('ok')}
        )
        .catch((err: any) => {
            return next(err);
        })
    );
}
