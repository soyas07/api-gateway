import express from 'express';
import emojis from './emojis.js';
import service from './service.js';
import axios from 'axios';

import dotenv from 'dotenv';
import createCircuitBreaker from '../middlewares/circuitBreaker.js';
import { auth } from '../controllers/auth.js';
import { authMiddleware} from '../middlewares/middlewares.js';


// load the environment vairables
const env = (process.env.npm_lifecycle_event == 'dev') ? '.env.dev' : '.env';
dotenv.config({ path: env });

const router = express.Router();
const circuitBreaker = createCircuitBreaker();

router.get('/', (req, res) => {
    // res.json({
    //     message: 'API - 👋🌎🌍🌏',
    // });
    circuitBreaker.execute(async () => {
        const test = await axios.post(`http://${process.env.USER_MICROSERVICES}:5050/api/v1/user/login`, req.body);
        res.json({
            message: 'API - 👋🌎🌍🌏',
        });
        // res.status(500).json({ error: error.message });
    }).catch(error => {
        res.status(500).json({ error: error.message });
    });
});


// get a user info by id
router.get('/user', authMiddleware(circuitBreaker), async (req, res) => {
    try {
        const { id } = req.query;
        const user = await axios(`http://${process.env.USER_MICROSERVICES}:5050/api/v1/user?id=${id}`);
        res.send(user.data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


// login and registration user routes
router.post('/user/login', async (req, res) => {
    try {
        await circuitBreaker.execute(async () => {
            // get the user req json object
            // forwards to `user-microservices`
            const validateUser = await axios.post(`http://${process.env.USER_MICROSERVICES}:5050/api/v1/user/login`, req.body);
            if (validateUser.data.message != 'ok') {
                console.log(validateUser.status);
                res.status(validateUser.status).send(validateUser.data);
            }

            const tokens = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/token`, { roles: ["user"] });
            console.log(tokens.status);

            if (tokens.status == 200) {
                res.cookie('token', tokens.data.token, { httpOnly: true, path: '/', secure: true, maxAge: 60 * 60 * 1000, sameSite: 'strict' }); // Set the token in cookies
                res.cookie('refreshToken', tokens.data.refreshToken, { path: '/', httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'strict' }); // Set the refresh token in cookies

                return res.send({ message: 'ok' });
            }

        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.get('/user/renewToken', async(req, res) => {
    circuitBreaker.execute(async () => {
        try {
            const cookies = req.cookies;
            const token = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/renewToken`, cookies);
            res.cookie('token', token.data.token, { httpOnly: true, path: '/', secure: true, maxAge: 60 * 60 * 1000, sameSite: 'strict' }); // Set the token in cookies
            res.send({ message: 'ok' });
        } catch (error) {
            // console.log(error);
            res.status(500).json({ message: error.message });
        }
    }).catch(error => {
        res.status(500).json({ message: error.message });
    });
});


router.post('/user/register', async (req, res) => {
    circuitBreaker.execute(async () => {
        try {
            const validateUser = await axios.post(`http://${process.env.USER_MICROSERVICES}:5050/api/v1/user/register`, req.body);
            if (validateUser.data.message != 'ok')
                res.send(validateUser.data);

            const tokens = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/token`, { roles: ["user"] });
            res.cookie('token', tokens.data.token, { httpOnly: true, path: '/', secure: true, maxAge: 60 * 60 * 1000, sameSite: 'strict' }); // Set the token in cookies
            res.cookie('refreshToken', tokens.data.refreshToken, { path: '/', httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'strict' }); // Set the refresh token in cookies
            res.send({ message: 'ok' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }).catch(error => {
        res.status(500).json({ message: error.message });
    });
})


router.get('/auth', auth);

router.use('/emojis', emojis);
router.use('/service', service);

export default router;
