import express, { Router } from 'express';
import {createImage, fetchImages, getImage, updateImage} from './controllers/images';
import { fetchPoints } from './controllers/points';

var router: Router = express.Router();
router.get('/images', fetchImages);
router.get('/points', fetchPoints);
router.get('/image/:id', getImage);
router.post('/image', createImage);
router.put('/image/:id', updateImage);
router.all('*', (req, res) => {
    res.send(`this route does not exist: ${req.url}`);
});

export default router;
