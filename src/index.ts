require('dotenv').config();

import express = require('express');
import routes from './routes';
import { errorHandler } from './middlewares/Errorhandler';
import mongoose = require('mongoose');
import bodyParser = require('body-parser');
import multer = require('multer');
import cors from 'cors';
import cookieParser from 'cookie-parser';

const PORT: any = process.env.PORT ?? 1111;

function run(): void {
    if (!process.env?.mongouri) {
        return console.error('no mongo uri provided');
    }
    mongoose
        .connect(process.env.mongouri)
        .then(() => {
            const app = express();
            app.use(express.static(__dirname + '../temp'));
            app.use(express.static('temp'));
            app.use(bodyParser.urlencoded({ extended: true, type: 'application/*+json' }));
            app.use(bodyParser.json());
            app.use(cookieParser());
            app.use(cors({ origin: process.env.clientUrl, credentials: true }));
            app.use(multer().single('image'));
            app.use(routes);
            app.use(errorHandler);
            app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
        })
        .catch(err => console.log(err));
}
run();
