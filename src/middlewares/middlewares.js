import jwt from 'jsonwebtoken';

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
  