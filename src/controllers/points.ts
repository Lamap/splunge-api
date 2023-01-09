import { NextFunction, Response, Request } from 'express';
import { PointModel } from '../models/Point';
import { IGetPointsBySphereRectRequest, ILocationRect, IPointCreateRequest } from '../interfaces';
import ImageModel, { IImage } from '../models/Image';
import { IPointCreateResponse, ISpgPoint } from 'splunge-common-lib';
const uuid = require('uuid');

export async function queryPointsInRect(locationRect: ILocationRect): Promise<ISpgPoint[]> {
    return PointModel.find({
        $and: [
            {
                'location.lat': {
                    $gt: locationRect.minLat,
                    $lt: locationRect.maxLat,
                },
                'location.lon': {
                    $gt: locationRect.minLon,
                    $lt: locationRect.maxLon,
                },
            },
        ],
    }).lean();
}
export async function getAllPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    // get all points
    const allPoints: ISpgPoint[] = await PointModel.find({}).lean();
    res.send(allPoints);
}

export async function getPointsBySphereRect(req: IGetPointsBySphereRectRequest, res: Response<ISpgPoint[]>, next: NextFunction): Promise<void> {
    if (!req.body.locationRect?.maxLat || !req.body.locationRect?.maxLon || !req.body.locationRect?.minLat || !req.body.locationRect?.minLon) {
        return next({
            status: 400,
            message: 'Incorrect location rect',
        });
    }
    const containedPoints: ISpgPoint[] = await queryPointsInRect(req.body.locationRect);
    res.json(containedPoints);
}
export async function createPoint(req: IPointCreateRequest, res: Response<IPointCreateResponse>, next: NextFunction): Promise<void> {
    if (!req.body.point.position.lat || !req.body.point.position.lng) {
        return next({
            status: 400,
            message: 'No location given',
        });
    }
    if (!req.body.imageId) {
        return next({
            status: 400,
            message: 'You can create a point only by attaching to an image',
        });
    }
    const points: ISpgPoint[] = await PointModel.find({}).lean();
    /// TODO: do it by mongo
    const adjustedPoints: ISpgPoint[] = points.map((point: ISpgPoint) => {
        return {
            ...point,
            images: point.images.filter((imageId: string) => imageId !== req.body.imageId),
        };
    });
    const newPoint = new PointModel({
        ...req.body.point,
        images: [req.body.imageId],
        id: uuid.v1(),
    });
    newPoint.save().catch((err: Error) => {
        next(err);
    });
    res.send([...adjustedPoints, newPoint]);
}

export async function getImagesOfPoint(req: Request, res: Response<IImage[]>, next: NextFunction): Promise<void> {
    if (!req.params?.pointId) {
        return next({
            status: 400,
            message: 'Wrong point id',
        });
    }
    const imagesOfPoint: IImage[] = await ImageModel.find({
        pointId: req.params.pointId,
    }).lean();
    res.json(imagesOfPoint);
}

export function updatePoint(req: Request, res: Response, next: NextFunction): void {}
export function deletePoint(req: Request, res: Response, next: NextFunction): void {}
