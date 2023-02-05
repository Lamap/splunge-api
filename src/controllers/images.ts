import { NextFunction, Response, Request } from 'express';
import { ICreateImageRequest, IDeleteImageRequest, IImageUpdateRequest, IPointOfImageRequest, ISplungeRequest } from '../interfaces';
import ImageModel, { IImage } from '../models/Image';
import { PointModel } from '../models/Point';
import { IImageDeleteResponse, IImageUpdateResponse, ISpgImage, ISpgPoint, PointOfImageResponse } from 'splunge-common-lib';
import { createImageUrl } from '../utils/createImageUrl';
import { AnyBulkWriteOperation } from 'mongodb';
import * as fbAdmin from 'firebase-admin';
import * as uuid from 'uuid';
const storageFolder: string = 'TEST';
const fbServiceAccount = require('../../fireBaseAdminConfig.json');
fbAdmin.initializeApp({
    credential: fbAdmin.credential.cert(fbServiceAccount),
    databaseURL: process.env.databaseURL,
});
const storage = fbAdmin.storage();
const storageRef = storage.bucket(process.env.storagePath);

export async function fetchAllImages(req: Request, res: Response<ISpgImage[]>, next: NextFunction): Promise<ISpgImage[] | void> {
    try {
        const images: ISpgImage[] = await ImageModel.find({}).sort({ _id: -1 }).lean();
        res.json(images);
    } catch (err) {
        next(err);
    }
}
/*
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
 */
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

export async function createImage(req: ICreateImageRequest, res: Response<ISpgImage>, next: NextFunction): Promise<Response<IImage> | void> {
    if (!req.file) {
        return next({
            status: 400,
            message: 'No image attached',
        });
    }
    try {
        const widthPerHeightRatio: number = req.body.widthPerHeightRatio;
        const imagePath: string = `${storageFolder}/${req.file.originalname}`;

        const saveError: null | Error = await saveFileIntoStorage(req, imagePath);
        if (!!saveError) {
            return next(saveError);
        }
        const signedUrL: string[] = await storageRef.file(imagePath).getSignedUrl({ action: 'read', expires: '02-22-2222' });
        const id: string = uuid.v1();
        const newImage = await new ImageModel({
            id,
            imagePath,
            url: signedUrL[0],
            widthPerHeightRatio,
        }).save();
        return res.json(newImage);
    } catch (err) {
        next(err);
    }
}

async function saveFileIntoStorage(req: ICreateImageRequest, imagePath: string): Promise<Error | null> {
    return new Promise((resolve, reject) => {
        if (!req.file) {
            return reject('file is not defined');
        }
        storageRef.file(imagePath).save(
            req.file?.buffer,
            {
                contentType: req.file?.mimetype,
            },
            (err?: Error | null) => {
                if (!err) {
                    return resolve(null);
                }
                return reject(err);
            },
        );
    });
}

export async function updateImage(req: IImageUpdateRequest, res: Response<IImageUpdateResponse>, next: NextFunction): Promise<void> {
    if (!req.params.id) {
        return next({ message: 'No image id provided for update', status: 400 });
    }
    if (!req.body) {
        return next({ message: 'No data provided for update', status: 400 });
    }
    try {
        const updatedImage: ISpgImage | null = await ImageModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!updatedImage) {
            return next({ message: `No image found with this id: ${req.params.id}`, status: 404 });
        }
        res.send(updatedImage);
    } catch (err) {
        next(err);
    }
}
export async function deleteImage(req: IDeleteImageRequest, res: Response<IImageDeleteResponse>, next: NextFunction): Promise<void> {
    if (!req.params.id) {
        console.log(req.params.id);
        return next({ message: 'No file id has been sent.', status: 400 });
    }
    const imageToDelete: string = req.params.id;

    try {
        const pointsToUpdate: ISpgPoint[] = await PointModel.find({ images: { $in: [imageToDelete] } });
        const updatePointOperations: AnyBulkWriteOperation<ISpgPoint>[] = pointsToUpdate.map((point: ISpgPoint) => {
            return {
                updateOne: {
                    filter: { id: point.id },
                    update: {
                        images: point.images.filter(id => id !== imageToDelete),
                    },
                },
            };
        });
        await PointModel.bulkWrite(updatePointOperations);
        const updatedImageIds: string[] = pointsToUpdate.map(point => point.id);
        const updatedPoints: ISpgPoint[] = await PointModel.find({ id: { $in: updatedImageIds } });
        const deletedImage: IImage = await ImageModel.findOneAndDelete({ id: imageToDelete }).lean();
        const file = storageRef.file(deletedImage.imagePath);
        await file.delete();
        res.json({
            deletedImageId: imageToDelete,
            updatedPoints,
        });
    } catch (err) {
        next(err);
    }
}
export async function getPointOfImage(req: IPointOfImageRequest, res: Response<PointOfImageResponse>, next: NextFunction): Promise<void> {
    if (!req.params.id) {
        return next({ message: 'No image id.', status: 400 });
    }
    try {
        const pointOfImage: ISpgPoint | null = await PointModel.findOne({ images: req.params.id });
        console.log(`pointOfImage: ${pointOfImage}`);
        res.json(pointOfImage);
    } catch (err) {
        next(err);
    }
}
