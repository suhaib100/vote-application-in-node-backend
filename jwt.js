const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing', status: 401 });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing', status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attaching the decoded user info to the request
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error('JWT verification failed:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired', status: 401 });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token', status: 403 });
        } else if (error.name === 'NotBeforeError') {
            return res.status(403).json({ message: 'Token not active yet', status: 403 });
        }

        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};


const generateToken = (userData) => {
    if (!userData || typeof userData !== 'object') {
        throw new Error('Payload must be an object');
    }
    return jwt.sign(
        { id: userData.id,
            username: userData.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expiry
    );};

module.exports = { jwtAuthMiddleware, generateToken };
