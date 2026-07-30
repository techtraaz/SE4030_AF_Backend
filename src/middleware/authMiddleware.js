import jwt from "jsonwebtoken";
import User from "../models/auth/user.js";
import { ACCOUNT_STATUSES, ROLES } from "../utils/constants.js";
import BlacklistedToken from "../models/auth/blacklistedToken.js";

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.unauthorized("No token provided");

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.unauthorized("Token has been invalidated. Please login again");
        }

        const user = await User.findById(decoded.id);
        if (!user || user.status !== ACCOUNT_STATUSES.ACTIVE) {
            return res.unauthorized("Invalid or inactive user");
        }

        req.user = user;
        next();
    } catch (error) {
        return res.unauthorized("Invalid token");
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== ROLES.ADMIN) {
        return res.forbidden("Admin access required");
    }
    next();
};

const authorizeRefugee = (req, res, next) => {
    if (req.user.role !== ROLES.REFUGEE) {
        return res.forbidden("Refugee access required");
    }
    next();
};

const authorizeContentContributor = (req, res, next) => {
    if (req.user.role !== ROLES.CONTENT_CONTRIBUTOR) {
        return res.forbidden("Content Contributor access required");
    }
    next();
};

const authorizeRoles = (...roles) => (req, res, next) => {
    const allowedRoles = roles.length > 0 ? roles : Object.values(ROLES);
    if (!allowedRoles.includes(req.user.role)) {
        return res.forbidden("Access denied");
    }
    next();
};

/**
 * Optional authentication middleware
 * Extracts user from token if present, but doesn't fail if no token
 * Used for public routes that need to optionally check authentication
 */
const optionalAuthenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without user
    if (!authHeader) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            // Token is blacklisted, continue without user
            req.user = null;
            return next();
        }

        const user = await User.findById(decoded.id);
        if (!user || user.status !== ACCOUNT_STATUSES.ACTIVE) {
            // Invalid user, continue without user
            req.user = null;
            return next();
        }

        req.user = user;
        next();
    } catch (error) {
        // Invalid token, continue without user
        req.user = null;
        next();
    }
};

export {authenticate, optionalAuthenticate, authorizeAdmin, authorizeRoles, authorizeRefugee, authorizeContentContributor};