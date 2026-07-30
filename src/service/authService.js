import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth/user.js";
import BlacklistedToken from "../models/auth/blacklistedToken.js";
import { ROLES, ACCOUNT_STATUSES } from "../utils/constants.js";

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

const signup = async (data, role = ROLES.USER) => {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const status =
        role === ROLES.CONTENT_CONTRIBUTOR
            ? ACCOUNT_STATUSES.PENDING
            : ACCOUNT_STATUSES.ACTIVE;

    const user = await User.create({
        email: data.email,
        password: hashedPassword,
        role,
        status
    });

    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
};

const login = async (data) => {
    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    if (user.status === ACCOUNT_STATUSES.PENDING) {
        throw new Error("Your account is pending admin approval");
    }

    if (user.status === ACCOUNT_STATUSES.REJECTED) {
        throw new Error("Your account has been rejected");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    const token = generateToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    return { user : userObj, token };
};

const logout = async (token) => {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
        throw new Error("Invalid token");
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await BlacklistedToken.create({ token, expiresAt });
};

export {signup , login, logout};