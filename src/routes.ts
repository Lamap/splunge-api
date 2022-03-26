import express, { Router } from 'express';
import {
    attachPointToImage,
    createImage,
    detachPointFromImage,
    fetchAllImages,
    fetchImagesByRect,
    getImage,
    renderImage,
    updateImage
} from './controllers/images';
import {createPoint, getImagesOfPoint, getPointsBySphereRect} from './controllers/points';

var router: Router = express.Router();
router.get('/images', fetchAllImages);
router.get('/images-by-rect', fetchImagesByRect);
router.get('/image/:id', getImage);
router.get('/image/:id/render', renderImage);
router.put('/image/:imageId/point/:pointId', attachPointToImage);
router.delete('/image/:imageId/point/:pointId', detachPointFromImage);
router.post('/image', createImage);
router.put('/image/:id', updateImage);
router.post('/point', createPoint);
router.get('/points-by-rect', getPointsBySphereRect);
router.get('/point/:pointId/images', getImagesOfPoint);


router.all('*', (req, res) => {
    res.send(`this route does not exist: ${req.url}`);
});

export default router;
