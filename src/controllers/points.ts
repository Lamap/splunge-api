import { NextFunction, Response, Request } from 'express';
import { PointModel } from '../models/Point';
import {
    IAttachPointToImageRequest,
    IDeletePointRequest,
    IDetachPointFromImageRequest,
    IGetPointsByLatLngBoundsRequest,
    IPointCreateRequest,
    IPointUpdateRequest,
} from '../interfaces';
import ImageModel, { IImage } from '../models/Image';
import {
    IPointAttachResponse,
    IPointCreateResponse,
    IPointDeleteResponse,
    IPointDetachResponse,
    IPointUpdateResponse,
    ISpgPoint,
} from 'splunge-common-lib';
import { AnyBulkWriteOperation } from 'mongodb';
import { LatLngBoundsLiteral } from 'leaflet';
import { ISpgLatLngBounds } from 'splunge-common-lib/lib/interfaces/ISpgLatLngBounds';
const uuid = require('uuid');

export async function queryPointsInRect(bounds: ISpgLatLngBounds): Promise<ISpgPoint[]> {
    console.log(bounds);
    return PointModel.find({
        $and: [
            {
                'position.lat': {
                    $gt: bounds.south,
                    $lt: bounds.north,
                },
                'position.lng': {
                    $gt: bounds.west,
                    $lt: bounds.east,
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

export async function getPointsByLatLngBounds(req: IGetPointsByLatLngBoundsRequest, res: Response<ISpgPoint[]>, next: NextFunction): Promise<void> {
    const bounds: ISpgLatLngBounds = req.body;
    if (!bounds) {
        return next({
            status: 400,
            message: 'Incorrect location rect',
        });
    }
    try {
        const containedPoints: ISpgPoint[] = await queryPointsInRect(bounds);
        res.json(containedPoints);
    } catch (err) {
        next(err);
    }
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
export async function deletePoint(req: IDeletePointRequest, res: Response<IPointDeleteResponse>, next: NextFunction): Promise<void> {
    if (!req.params.id) {
        return next({ message: 'Missing point id', status: 400 });
    }
    try {
        const imageToDelete: ISpgPoint = await PointModel.findOne({ id: req.params.id }).lean();
        if (!!imageToDelete.images.length) {
            return next({ message: 'This point has some images attached, first to have to delink the images', status: 400 });
        }
        await PointModel.findOneAndDelete({ id: req.params.id });
        res.json({
            deletedPointId: req.params.id,
        });
    } catch (err) {
        next(err);
    }
}
export async function updatePoint(req: IPointUpdateRequest, res: Response<IPointUpdateResponse>, next: NextFunction): Promise<void> {
    try {
        if (!req.params.id) {
            return next({ message: 'Missing point id', status: 400 });
        }
        const updatedPoint: ISpgPoint = await PointModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }).lean();
        res.json(updatedPoint);
    } catch (err) {
        next(err);
    }
}

export async function detachPointFromImage(
    req: IDetachPointFromImageRequest,
    res: Response<IPointDetachResponse>,
    next: NextFunction,
): Promise<void> {
    if (!req.params.id) {
        return next({
            status: 400,
            message: 'ImageId is missing',
        });
    }
    const imageId: string = req.params.id;
    const pointToUpdate: ISpgPoint = await PointModel.findOne({ images: { $in: [imageId] } }).lean();

    try {
        const updatedPoint: ISpgPoint | null = await PointModel.findOneAndUpdate(
            {
                images: { $in: [imageId] },
            },
            {
                $set: {
                    images: pointToUpdate.images.filter(id => id !== imageId),
                },
            },
            { new: true },
        ).lean();
        if (!pointToUpdate || !updatedPoint) {
            return next({
                status: 404,
                message: 'Could not find the image',
            });
        }
        res.json(updatedPoint);
    } catch (err) {
        next(err);
    }
}

export async function attachImageToPoint(req: IAttachPointToImageRequest, res: Response<IPointAttachResponse>, next: NextFunction): Promise<void> {
    if (!req.params.imageId || !req.params.pointId) {
        return next({
            status: 400,
            message: 'ImageId or pointId is missing',
        });
    }
    try {
        const affectedPoints: ISpgPoint[] | null = await PointModel.find({
            $or: [{ id: req.params.pointId }, { images: { $in: [req.params.imageId] } }],
        });
        if (affectedPoints.find(point => point.id === req.params.pointId && point.images.includes(req.params.imageId))) {
            return next({ message: 'This image has already assigned to the point', status: 400 });
        }
        const updatePointOperations: AnyBulkWriteOperation<ISpgPoint>[] = affectedPoints.map((point: ISpgPoint) => {
            const images: string[] =
                point.id === req.params.pointId
                    ? [...point.images, req.params.imageId]
                    : point.images.filter(imageId => imageId !== req.params.imageId);
            return {
                updateOne: {
                    filter: { id: point.id },
                    update: {
                        images: images,
                    },
                },
            };
        });
        await PointModel.bulkWrite(updatePointOperations);
        console.log(affectedPoints.length);
        const updatedPoints: ISpgPoint[] = await PointModel.find({ id: { $in: affectedPoints.map(point => point.id) } });
        res.json(updatedPoints);
    } catch (err) {
        next(err);
    }
}
