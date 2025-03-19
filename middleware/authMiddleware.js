const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(" ")[1];  // Extract token from "Bearer <token>" header

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        // Decode the token and log the decoded token for debugging
        const decoded = jwt.verify(token, JWT_SECRET);  

        // Ensure that the decoded token has the expected fields (e.g., userId and role)
        if (!decoded || !decoded.userId || !decoded.role) {
            return res.status(401).json({ message: "Invalid token structure" });
        }

        // Attach the decoded user info (including _id, role) to the request object
        req.user = {
            id: decoded.userId,   // Assuming 'userId' is in the decoded JWT
            role: decoded.role,   // Assuming 'role' is in the decoded JWT
        };

        // Log req.user to ensure the user details are being passed
        // console.log("req.user in Middleware:", req.user);  // This should contain userId and role

        next();  // Proceed with the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
