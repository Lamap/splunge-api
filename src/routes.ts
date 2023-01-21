import express, { Router, Request, Response } from 'express';
import { createImage, deleteImage, fetchAllImages, getImage, getPointOfImage, renderImage, updateImage } from './controllers/images';
import {
    attachImageToPoint,
    createPoint,
    deletePoint,
    detachPointFromImage,
    getAllPoints,
    getImagesOfPoint,
    getPointsByLatLngBounds,
    updatePoint,
} from './controllers/points';
import { createUser, listUsers, logUserIn } from './controllers/user';
import { AuthHandler } from './middlewares/AuthHandler';
import { ApiRoutes } from 'splunge-common-lib';

const router: Router = express.Router();

router.get('/images', fetchAllImages);
router.get(ApiRoutes.SPG_IMAGE_FETCH, getImage);
router.get(ApiRoutes.SPG_IMAGE_RENDER, renderImage);
router.put(ApiRoutes.SPG_ATTACH_IMAGE_TO_POINT, attachImageToPoint);
router.delete(ApiRoutes.SPG_DETACH_POINT_FROM_IMAGE, detachPointFromImage);
router.delete(ApiRoutes.SPG_IMAGE_UPDATE_AND_DELETE, deleteImage);
router.delete(ApiRoutes.SPG_POINT_UPDATE_AND_DELETE, deletePoint);
router.post(ApiRoutes.SPG_IMAGE_CREATE, createImage);
router.put(ApiRoutes.SPG_IMAGE_UPDATE_AND_DELETE, updateImage);
router.put(ApiRoutes.SPG_POINT_UPDATE_AND_DELETE, updatePoint);
router.post(ApiRoutes.SPG_POINT_CREATE, createPoint);
router.get(ApiRoutes.SPG_POINTS_FETCH, getAllPoints);
router.post(ApiRoutes.SPG_POINTS_BY_BOUNDS, getPointsByLatLngBounds);
router.get(ApiRoutes.SPG_POINT_OF_IMAGE, getPointOfImage);
router.get('/point/:pointId/images', getImagesOfPoint);
router.post('/user', createUser);
router.get('/users', AuthHandler, listUsers);
router.post('/login', logUserIn);

router.all('*', (req: Request, res: Response) => {
    res.status(404).send(`this route does not exist: ${req.url}`);
});

export default router;
