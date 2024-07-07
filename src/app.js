import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import dotenv from 'dotenv';
import { notFound, errorHandler } from './middlewares/middlewares.js';
import api from './api/index.js';
import cookieParser from 'cookie-parser';
import createCircuitBreaker from './middlewares/circuitBreaker.js';

// load the environment vairables
const env = (process.env.npm_lifecycle_event == 'dev') ? '.env.dev' : '.env';
dotenv.config({ path: env });

const app = express();
// const circuitBreaker = new createCircuitBreaker();

app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
    });
});


app.use('/api/v1', api);

app.use(notFound);
app.use(errorHandler);

export default app
