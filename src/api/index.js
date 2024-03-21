import express from 'express';
import emojis from './emojis.js';
import service from './service.js';
import axios from 'axios';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'API - 👋🌎🌍🌏',
    });
});

// login and registration user routes
router.post('/user/login', async (req, res) => {
    try {
        // get the user req json object
        // forwards to `user-microservices`
        const validateUser = await axios.post(`http://${process.env.USER_MICROSERVICES}:5050/api/v1/user/login`, req.body);
        if (validateUser.data.message != 'ok')
            res.send(validateUser.data);

        const tokens = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/token`, { roles: ["user"] });
        console.log(tokens.status);

        if (tokens.status == 200) {
            res.cookie('token', tokens.data.token, { httpOnly: true, path: '/', secure: true, maxAge: 60 * 60 * 1000, sameSite: 'strict' }); // Set the token in cookies
            res.cookie('refreshToken', tokens.data.refreshToken, { path: '/', httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'strict' }); // Set the refresh token in cookies
    
            res.send({ message: 'ok' });
        }
    } catch (error) {
        res.send({ message: error });
    }
});


router.get('/user/renewToken', async(req, res) => {
    try {
        const cookies = req.cookies;
        const token = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/renewToken`, cookies);
        res.cookie('token', token.data.token, { httpOnly: true, path: '/', secure: true, maxAge: 60 * 60 * 1000, sameSite: 'strict' }); // Set the token in cookies
        res.send({ message: 'ok' });
    } catch (error) {
        // console.log(error);
        res.send({ message: error });
    }
});


router.post('/user/register', async (req, res) => {
    try {
        const validateUser = await axios.post(`http://${process.env.USER_MICROSERVICES}:5050/api/v1/user/register`, req.body);
        if (validateUser.data.message != 'ok')
            res.send(validateUser.data);

        const tokens = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/token`, { roles: ["user"] });
        res.cookie('token', tokens.data.token, { httpOnly: true, path: '/', secure: true, maxAge: 60 * 60 * 1000, sameSite: 'strict' }); // Set the token in cookies
        res.send({ message: 'ok' });
    } catch (error) {
        res.send({ message: error });
    }
})

router.use('/emojis', emojis);
router.use('/service', service);

export default router;
