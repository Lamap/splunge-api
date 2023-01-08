import axios, { AxiosResponse } from 'axios';
import { NextFunction, Response, Request } from 'express';
import { IAttachPointToImageRequest, IFetchImagesByRectRequest, ISplungeRequest } from '../interfaces';
import ImageModel, { IImage } from '../models/Image';
import { PointModel } from '../models/Point';
import { queryPointsInRect } from './points';
import { ISpgPoint } from 'splunge-common-lib/src';

const uuid = require('uuid');
const storageFolder: string = 'TEST';
const fbAdmin = require('firebase-admin');
const fbServiceAccount = require('../../fireBaseAdminConfig.json');
fbAdmin.initializeApp({
    credential: fbAdmin.credential.cert(fbServiceAccount),
    databaseURL: process.env.databaseURL,
});
const storageRef = fbAdmin.storage().bucket(process.env.storagePath);
const fs = require('fs');

export function fetchAllImages(req: Request, res: Response<IImage[]>, next: NextFunction): Response<IImage[] | void> | void {
    ImageModel.find({})
        .then((result: IImage[]) => {
            return res.json(result);
        })
        .catch(err => next(err));
}
export async function fetchImagesByRect(req: IFetchImagesByRectRequest, res: Response<IImage[]>, next: NextFunction): Promise<void> {
    if (!req.body?.locationRect?.maxLat || !req.body?.locationRect?.maxLon || !req.body?.locationRect?.minLat || !req.body?.locationRect?.minLon) {
        return next({
            message: 'Incorrect location rect',
            status: 400,
        });
    }
    const pointsInTheRect: ISpgPoint[] = await queryPointsInRect(req.body.locationRect);
    const pointIdsInTheRect: string[] = pointsInTheRect.map(point => point.id);
    const imagesInTheRect: IImage[] = await ImageModel.find({
        pointId: {
            $in: pointIdsInTheRect,
        },
    }).lean();
    res.json(imagesInTheRect);
}
export async function getImage(req: ISplungeRequest, res: Response<IImage>, next: NextFunction): Promise<void> {
    const imageId: string | undefined = req.params.id;
    if (!imageId || imageId?.length !== 36) {
        return next({
            message: 'wrong id, bad request',
            status: 400,
        });
    }
    const image: IImage | null = await ImageModel.findOne({ id: imageId });
    if (!image) {
        return next({
            message: `No image with this id ${imageId}`,
            status: 404,
        });
    }
    res.json(image);
}
export async function renderImage(req: ISplungeRequest, res: Response<IImage | string | Buffer>, next: NextFunction): Promise<void> {
    const imageId: string | undefined = req.params.id;
    if (!imageId || imageId?.length !== 36) {
        return next({
            message: 'wrong id, bad request',
            status: 400,
        });
    }
    const image: IImage | null = await ImageModel.findOne({ id: imageId });
    if (!image) {
        return next({
            message: `No image with this id ${imageId}`,
            status: 404,
        });
    }

    const imageTemplLocation: string = `${process.env.templocation}/${image.imagePath.split('/').pop()}`;
    try {
        storageRef
            .file(image.imagePath)
            .download({
                destination: imageTemplLocation,
            })
            .then(() => {
                res.sendFile(image.imagePath.split('/').pop()!, { root: `./${process.env.templocation}` }, () => {
                    fs.unlinkSync(imageTemplLocation);
                });
            });
    } catch (err: unknown) {
        next({ message: err, status: 500 });
    }
}

export async function createImage(req: ISplungeRequest, res: Response<IImage>, next: NextFunction): Promise<Response<IImage> | void> {
    if (!req.file) {
        return next({
            status: 400,
            message: 'No image attached',
        });
    }
    const imagePath: string = `${storageFolder}/${req.file.originalname}`;
    storageRef.file(imagePath).save(
        req.file.buffer,
        {
            contentType: req.file?.mimetype,
        },
        (err: Error) => {
            if (err) {
                return next({ message: `Could not save file: ${err}`, status: 500 });
            }
            const publicUrl: string = storageRef.file(imagePath).publicUrl();

            const newImage = new ImageModel({
                id: uuid.v1(),
                imagePath,
                url: publicUrl,
            });
            newImage
                .save()
                .then(() => {
                    return res.status(200).json(newImage);
                })
                .catch((err: Error) => {
                    return next(err);
                });
        },
    );
}

export function updateImage(req: Request, res: Response, next: NextFunction): Response<void> {
    console.log(req.params.id);
    return res.send('updated');
}

export async function attachPointToImage(req: IAttachPointToImageRequest, res: Response<IImage>, next: NextFunction): Promise<void> {
    if (!req.params.imageId || !req.params.pointId) {
        return next({
            status: 400,
            message: 'ImageId or pointId is missing',
        });
    }

    const point: ISpgPoint | null = await PointModel.findOne({ id: req.params.pointId });
    if (!point) {
        return next({ message: `No point with this id ${req.params.pointId}`, status: 400 });
    }

    const updatedImage: IImage | null = await ImageModel.findOneAndUpdate(
        {
            id: req.params.imageId,
        },
        {
            $set: {
                pointId: req.params.pointId,
            },
        },
    );

    if (!updatedImage) {
        return next({ message: 'Could not find image to update', status: 404 });
    }
    res.json(updatedImage);
}

export function detachPointFromImage(req: Request, res: Response, next: NextFunction): void {
    if (!req.params.imageId || !req.params.pointId) {
        return next({
            status: 400,
            message: 'ImageId or pointId is missing',
        });
    }
    ImageModel.findOneAndUpdate(
        {
            id: req.params.imageId,
        },
        {
            $set: {
                pointId: null,
            },
        },
    );
}
