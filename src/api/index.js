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
        console.log(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/token`);
        res.send(tokens.data);
    } catch (error) {
        res.send({ message: error });
    }
});

router.post('/user/register', async (req, res) => {
    try {
        const validateUser = await axios.post(`http://${process.env.USER_MICROSERVICES}:5050/api/v1/user/register`, req.body);
        if (validateUser.data.message != 'ok')
            res.send(validateUser.data);

        const tokens = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/token`, { roles: ["user"] });
        res.send({ email: req.body.email, tokens: tokens.data});
    } catch (error) {
        res.send({ message: error });
    }
})

router.use('/emojis', emojis);
router.use('/service', service);

export default router;
