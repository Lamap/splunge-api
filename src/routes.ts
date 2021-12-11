import express, { Router } from 'express';
import { fetchImages } from './controllers/images';
import { fetchPoints } from './controllers/points';

var router: Router = express.Router();
router.get('/images', fetchImages);
router.get('/points', fetchPoints);
export default router;
