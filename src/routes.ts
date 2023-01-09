import express, { Router } from 'express';
import {
    attachPointToImage,
    createImage,
    detachPointFromImage,
    fetchAllImages,
    fetchImagesByRect,
    getImage,
    renderImage,
    updateImage,
} from './controllers/images';
import { createPoint, getAllPoints, getImagesOfPoint, getPointsBySphereRect } from './controllers/points';
import { createUser, listUsers, logUserIn } from './controllers/user';
import { AuthHandler } from './middlewares/AuthHandler';
import { ApiRoutes } from 'splunge-common-lib';

var router: Router = express.Router();

router.get('/images', fetchAllImages);
router.get('/images-by-rect', AuthHandler, fetchImagesByRect);
router.get('/image/:id', getImage);
router.get('/image/:id/render', renderImage);
router.put('/image/:imageId/point/:pointId', attachPointToImage);
router.delete('/image/:imageId/point/:pointId', detachPointFromImage);
router.post('/image', createImage);
router.put('/image/:id', updateImage);
router.post(ApiRoutes.SPG_POINT_CREATE, createPoint);
router.get(ApiRoutes.SPG_POINTS_FETCH, getAllPoints);
router.get('/points-by-rect', getPointsBySphereRect);
router.get('/point/:pointId/images', getImagesOfPoint);
router.post('/user', createUser);
router.get('/users', listUsers);
router.post('/login', logUserIn);

router.all('*', (req, res) => {
    res.status(404).send(`this route does not exist: ${req.url}`);
});

export default router;
