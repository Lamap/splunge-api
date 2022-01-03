import { NextFunction, Response, Request } from 'express';
import {ISplungeRequest} from '../interfaces';
import ImageModel, { IImage } from '../models/Image';

const uuid = require('uuid');
const storageFolder: string = 'TEST';
const fbAdmin = require("firebase-admin");
const fbServiceAccount = require('../../fireBaseAdminConfig.json');
fbAdmin.initializeApp({
    credential: fbAdmin.credential.cert(fbServiceAccount),
    databaseURL: process.env.databaseURL,
});
const storageRef = fbAdmin.storage().bucket(process.env.storagePath);

export async function fetchImages(req: Request, res: Response, next: NextFunction): Promise<Response<IImage[] | string>> {
    const images: IImage[] = await ImageModel.find({});
    return res.status(200).json(images);
}
export function getImage(req: ISplungeRequest, res: Response, next: NextFunction): Response<IImage | void> | void {
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
            return res.status(200).json(image);
        })
        .catch((err: Error) => next(err));
}

export async function createImage(req: ISplungeRequest, res: Response, next: NextFunction): Promise<Response<IImage> | void> {
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
        saveImageData(publicUrl);
    });

    async function saveImageData(publicUrl: string): Promise<void> {
        const newImage: any = new ImageModel({
            id: uuid.v1(),
            url: publicUrl,
        });
        return (await newImage.save()
                .then(() => {
                    return res.status(200).json(newImage)}
                )
                .catch((err: any) => {
                    return next(err);
                })
        );
    }
}

export function updateImage(req: Request, res: Response, next: NextFunction): Response<void> {
    console.log(req.params.id);
    return res.send('updated');
}
