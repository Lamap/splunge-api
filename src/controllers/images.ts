import { NextFunction, Response, Request } from 'express';
import { IAttachPointToImageRequest, IDeleteImageRequest, IFetchImagesByRectRequest, IImageUpdateRequest, ISplungeRequest } from '../interfaces';
import ImageModel, { IImage } from '../models/Image';
import { PointModel } from '../models/Point';
import { queryPointsInRect } from './points';
import { IImageDeleteResponse, IImageUpdateResponse, IPointAttachResponse, ISpgImage, ISpgPoint } from 'splunge-common-lib';
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
const fs = require('fs');

export async function fetchAllImages(req: Request, res: Response<ISpgImage[]>, next: NextFunction): Promise<ISpgImage[] | void> {
    ImageModel.find({}, { imagePath: 0 })
        .sort({ _id: -1 })
        .lean()
        .then((result: ISpgImage[]) => {
            const images: ISpgImage[] = result;
            const updateImages: ISpgImage[] = images.map((image: ISpgImage) => {
                return {
                    ...image,
                    url: createImageUrl(image.id),
                };
            });
            res.json(updateImages);
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
    // TODO: adjust with a unique hash
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
        (err?: Error | null) => {
            if (err) {
                return next({ message: `Could not save file: ${err}`, status: 500 });
            }
            const publicUrl: string = storageRef.file(imagePath).publicUrl();
            // TODO: figure out how to serve image directly
            console.log(publicUrl);
            const id: string = uuid.v1();
            const url: string = createImageUrl(id);
            const newImage = new ImageModel({
                id,
                imagePath,
                url,
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
