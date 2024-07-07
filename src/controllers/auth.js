import axios from 'axios';

import dotenv from 'dotenv';
import createCircuitBreaker from '../middlewares/circuitBreaker.js';

// load the environment vairables
const env = (process.env.npm_lifecycle_event == 'dev') ? '.env.dev' : '.env';
dotenv.config({ path: env });

const circuitBreaker = createCircuitBreaker();

export const auth = async (req, res) => {
    circuitBreaker.execute(async () => {
        try {
            const { token, refreshToken } = req.cookies;
            console.log(token);

            if (token) {
                const authorize = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/auth`, null, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const response = await authorize.data;
                res.send(response);
            } else {
                if (refreshToken) {
                    const getToken = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/renewToken`, { refreshToken });
                    const newToken = await getToken.data;
                    res.cookie('token', newToken.token, { httpOnly: true, path: '/', secure: true, maxAge: 60 * 60 * 1000, sameSite: 'strict' }); // Set the token in cookies
                    res.send({ message: 'ok' });
                } else {
                    res.status(403).send({ message: 'Access forbidden' });
                }
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }).catch(error => {
        res.status(500).json({ message: error.message });
    })
}