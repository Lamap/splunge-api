import express, { Router, Request, Response } from 'express';
import { createImage, deleteImage, fetchAllImages, getImage, getPointOfImage, updateImage } from './controllers/images';
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
import { createUser, listUsers, logUserIn, logUserOut } from './controllers/user';
import { verifyAdmin } from './middlewares/VerifyAdmin';
import { ApiRoutes } from 'splunge-common-lib';

const router: Router = express.Router();

router.get(ApiRoutes.SPG_IMAGES_FETCH, fetchAllImages);
router.get(ApiRoutes.SPG_IMAGE_FETCH, getImage);
router.put(ApiRoutes.SPG_ATTACH_IMAGE_TO_POINT, verifyAdmin, attachImageToPoint);
router.delete(ApiRoutes.SPG_DETACH_POINT_FROM_IMAGE, verifyAdmin, detachPointFromImage);
router.delete(ApiRoutes.SPG_IMAGE_UPDATE_AND_DELETE, verifyAdmin, deleteImage);
router.delete(ApiRoutes.SPG_POINT_UPDATE_AND_DELETE, verifyAdmin, deletePoint);
router.post(ApiRoutes.SPG_IMAGE_CREATE, verifyAdmin, createImage);
router.put(ApiRoutes.SPG_IMAGE_UPDATE_AND_DELETE, verifyAdmin, updateImage);
router.put(ApiRoutes.SPG_POINT_UPDATE_AND_DELETE, verifyAdmin, updatePoint);
router.post(ApiRoutes.SPG_POINT_CREATE, verifyAdmin, createPoint);
router.get(ApiRoutes.SPG_POINTS_FETCH, getAllPoints);
router.post(ApiRoutes.SPG_POINTS_BY_BOUNDS, getPointsByLatLngBounds);
router.get(ApiRoutes.SPG_POINT_OF_IMAGE, getPointOfImage);
router.get('/point/:pointId/images', getImagesOfPoint);
router.post(ApiRoutes.SPG_CREATE_USER, verifyAdmin, createUser);
router.get('/users', verifyAdmin, listUsers);
router.post(ApiRoutes.SPG_LOG_USER_IN, logUserIn);
router.post(ApiRoutes.SPG_LOG_USER_OUT, logUserOut);

router.all('*', (req: Request, res: Response) => {
    res.status(404).send(`this route does not exist: ${req.url}`);
});

export default router;
