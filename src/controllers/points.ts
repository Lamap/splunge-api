import { NextFunction, Response, Request } from 'express';
import { IPoint, PointModel } from '../models/Point';
import {IGetPointsBySphereRectRequest, ILocationRect, IPointCreateRequest} from '../interfaces';
import {isLocationContainedByRect} from '../utils/isLocationContainedByRect';
import ImageModel, {IImage} from '../models/Image';
const uuid = require('uuid');

export async function queryPointsInRect(locationRect: ILocationRect): Promise<IPoint[]> {
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
            }
        ]
    }).lean();
}

export async function getPointsBySphereRect(req: IGetPointsBySphereRectRequest, res: Response<IPoint[]>, next: NextFunction): Promise<void> {
    if (
        !req.body.locationRect?.maxLat ||
        !req.body.locationRect?.maxLon ||
        !req.body.locationRect?.minLat ||
        !req.body.locationRect?.minLon
    ) {
        return next({
            status: 400,
            message: 'Incorrect location rect'
        })
    }
    const containedPoints: IPoint[] = await queryPointsInRect(req.body.locationRect);
    res.json(containedPoints);
}
export function createPoint(req: IPointCreateRequest, res: Response<IPoint>, next: NextFunction): void {
    if (!req.body.location?.lat || !req.body.location?.lon) {
        return next({
            status: 400,
            message: 'No location given',
        });
    }
    const newPoint = new PointModel({
        id: uuid.v1(),
        location: req.body.location,
    });
    newPoint.save()
        .then((result: IPoint) => {
            res.status(200).json(newPoint);
        })
        .catch((err: Error) => {
            next(err);
        });
}

export async function getImagesOfPoint(req: Request, res: Response<IImage[]>, next: NextFunction): Promise<void> {
    if (!req.params?.pointId) {
        return next({
            status: 400,
            message: 'Wrong point id',
        });
    }
    const imagesOfPoint: IImage[] = await ImageModel.find({
        image: req.params.pointId,
    }).lean();
    res.json(imagesOfPoint);
}

export function updatePoint(req: Request, res: Response, next: NextFunction): void {

}
export function deletePoint(req: Request, res: Response, next: NextFunction): void {

}


