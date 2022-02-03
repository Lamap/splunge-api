import axios, { AxiosResponse } from 'axios';
import { NextFunction, Response, Request } from 'express';
import {IAttachPointToImageRequest, IFetchImagesByRectRequest, ISplungeRequest} from '../interfaces';
import ImageModel, { IImage } from '../models/Image';
import {IPoint, PointModel} from '../models/Point';
import {queryPointsInRect} from './points';

const uuid = require('uuid');
const storageFolder: string = 'TEST';
const fbAdmin = require("firebase-admin");
const fbServiceAccount = require('../../fireBaseAdminConfig.json');
fbAdmin.initializeApp({
    credential: fbAdmin.credential.cert(fbServiceAccount),
    databaseURL: process.env.databaseURL,
});
const storageRef = fbAdmin.storage().bucket(process.env.storagePath);

export function fetchAllImages(req: Request, res: Response<IImage[]>, next: NextFunction): Response<IImage[] | void> | void {
    ImageModel.find({})
        .then((result: IImage[]) => {
            return res.json(result);
        })
        .catch(err => next(err));
}
export async function fetchImagesByRect(req: IFetchImagesByRectRequest, res: Response<IImage[]>, next: NextFunction): Promise<void> {
    if (
        !req.body?.locationRect?.maxLat ||
        !req.body?.locationRect?.maxLon ||
        !req.body?.locationRect?.minLat ||
        !req.body?.locationRect?.minLon
    ) {
        return next({
            message: 'Incorrect location rect',
            status: 400,
        })
    }
    const pointsInTheRect: IPoint[] = await queryPointsInRect(req.body.locationRect);
    const pointIdsInTheRect: string[] = pointsInTheRect.map(point => point.id);
    const imagesInTheRect: IImage[] = await ImageModel.find({
        pointId: {
            $in: pointIdsInTheRect,
        }
    }).lean();
    res.json(imagesInTheRect);
}
export function getImage(req: ISplungeRequest, res: Response<IImage | string>, next: NextFunction): void {
    const imageId: string | undefined = req.params.id;
    if (!imageId || imageId?.length !== 36) {
        return next({
            message: 'wrong id, bad request',
            status: 400,
        });
    }
    ImageModel.findOne({id: imageId})
        .then((image: IImage | null) => {
            if (!image) {
                return next({status: 404, message: `No image with this id ${imageId}`})
            }
            res.json(image);
        })
        .catch((err: Error) => next(err));
}

export async function createImage(req: ISplungeRequest, res: Response<IImage>, next: NextFunction): Promise<Response<IImage> | void> {
    if (!req.file) {
        return next({
            status: 400,
            message: 'No image attached',
        });
    }
    const imagePath: string = `${storageFolder}/${req.file.originalname}`;
    storageRef.file(imagePath).save(req.file.buffer, {
        contentType: req.file?.mimetype,
    }, (err: Error) => {
        if (err) {
            return next({message:`Could not save file: ${err}`, status: 500});
        }
        const publicUrl: string = storageRef.file(imagePath).publicUrl();
        const newImage = new ImageModel({
            id: uuid.v1(),
            url: publicUrl,
        });
        newImage.save()
            .then(() => {
                return res.status(200).json(newImage)}
            )
            .catch((err: Error) => {
                return next(err);
            });
    });
}

export function updateImage(req: Request, res: Response, next: NextFunction): Response<void> {
    console.log(req.params.id);
    return res.send('updated');
}

export function attachPointToImage(req: IAttachPointToImageRequest, res: Response, next: NextFunction): void {
    if (!req.params.imageId || !req.params.pointId) {
        return next({
            status: 400,
            message: 'ImageId or pointId is missing',
        });
    }
    ImageModel.findOneAndUpdate({
        id: req.params.imageId,
    }, {
        $set: {
            pointId: req.params.pointId,
        }
    });
}

export function detachPointFromImage(req: Request, res: Response, next: NextFunction): void {
    if (!req.params.imageId || !req.params.pointId) {
        return next({
            status: 400,
            message: 'ImageId or pointId is missing',
        });
    }
    ImageModel.findOneAndUpdate({
        id: req.params.imageId,
    }, {
        $set: {
            pointId: null,
        }
    });
}
