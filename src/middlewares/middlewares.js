import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

// load the environment vairables
const env = (process.env.npm_lifecycle_event == 'dev') ? '.env.dev' : '.env';
dotenv.config({ path: env });


export function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}
  
/* eslint-disable no-unused-vars */
export function errorHandler(err, req, res, next) {
    /* eslint-enable no-unused-vars */
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
}
  
// authentication
export const authenticate = (requiredRoles) =>  {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token)
            return res.status(401).json({ message: 'Access denied. No token provided.' });

        // verify the token
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            // throw error if the token does not match
            if (err)
                return res.status(401).json({ message: 'Invalid token' });

            // check the roles for specific resource access
            if (requiredRoles && requiredRoles.length > 0) {
                const userRoles = decoded.roles; // decode from JWT 
                
                const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
                if (!hasRequiredRole)
                    return res.status(403).json({ message: 'Access denied.' });
            }
            // authenticate to access resource if the roles match
            req.user = decoded;
            next();
        });
    }
}

// circuit breaker middleware
export const circuitBreakerMiddleware = (circuitBreaker) => {
    return (req, res, next) => {
        circuitBreaker.execute(async () => {
            try {
                await next(); // Continue to the next middleware or route handler
            } catch (error) {
                next(error); // Pass any errors to the error handler middleware
            }
        }).catch(error => {
            res.status(500).json({ error: error.message });
        });
    };
};


export const authMiddleware = (circuitBreaker) => {
    return async (req, res, next) => {
        circuitBreaker.execute(async () => {
            try {
                const { token, refreshToken } = req.cookies;

                if (token) {
                    const authorize = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/auth`, null, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    req.user = authorize.data; // Attach the user data to the request object
                    next(); // Proceed to the next middleware or route handler
                } else {
                    if (refreshToken) {
                        const getToken = await axios.post(`http://${process.env.AUTH_MICROSERVICES}:5001/api/v1/renewToken`, { refreshToken });
                        const newToken = getToken.data;
                        res.cookie('token', newToken.token, { httpOnly: true, path: '/', secure: true, maxAge: 60 * 60 * 1000, sameSite: 'strict' }); // Set the token in cookies
                        req.user = newToken.user; // Attach the user data to the request object
                        next(); // Proceed to the next middleware or route handler
                    } else {
                        res.status(403).send({ message: 'Access forbidden' });
                    }
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }).catch(error => {
            res.status(500).json({ message: error.message });
        });
    };
};
  