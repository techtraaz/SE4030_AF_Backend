import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify } from "jose";
import User from "../models/auth/user.js";
import { ROLES, ACCOUNT_STATUSES } from "../utils/constants.js";

// ─── Auth0 Configuration (Authorization Code flow) ─────────────────────────────
// Read lazily so environment variables are picked up at request time (dotenv,
// tests, etc. may set them after module load).
const getAuth0Config = () => ({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    redirectUri: process.env.AUTH0_REDIRECT_URI,
    issuer: process.env.AUTH0_DOMAIN ? `https://${process.env.AUTH0_DOMAIN}/` : null,
    authorizeUrl: process.env.AUTH0_DOMAIN ? `https://${process.env.AUTH0_DOMAIN}/authorize` : null,
    tokenUrl: process.env.AUTH0_DOMAIN ? `https://${process.env.AUTH0_DOMAIN}/oauth/token` : null,
    jwksUrl: process.env.AUTH0_DOMAIN ? `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json` : null,
});

// In-memory store for OAuth `state` values to prevent CSRF on the callback.
const stateStore = new Map();
const STATE_TTL_MS = 10 * 60 * 1000;

const buildAuthorizeUrl = () => {
    const config = getAuth0Config();
    if (!config.domain || !config.clientId || !config.redirectUri) {
        throw new Error("Auth0 configuration is incomplete");
    }

    const state = crypto.randomBytes(16).toString("hex");
    stateStore.set(state, { createdAt: Date.now() });

    const params = new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: "openid profile email",
        state,
    });

    return { url: `${config.authorizeUrl}?${params.toString()}`, state };
};

const verifyState = (state) => {
    if (!state) return false;
    const entry = stateStore.get(state);
    if (!entry) return false;
    stateStore.delete(state);
    return Date.now() - entry.createdAt < STATE_TTL_MS;
};

const exchangeCodeForTokens = async (code) => {
    const config = getAuth0Config();
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
    });

    const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || data.error || "Failed to exchange authorization code");
    }
    return data;
};

const verifyIdToken = async (idToken) => {
    const config = getAuth0Config();
    const JWKS = createRemoteJWKSet(new URL(config.jwksUrl));
    const { payload } = await jwtVerify(idToken, JWKS, {
        issuer: config.issuer,
        audience: config.clientId,
    });
    return payload;
};

const findOrCreateOAuthUser = async (profile) => {
    if (profile.email_verified === false) {
        throw new Error("Google account email is not verified");
    }

    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email }] });

    if (user) {
        if (!user.googleId) {
            user.googleId = profile.sub;
            user.authProvider = "google";
            user.displayName = user.displayName || profile.name;
            user.avatar = user.avatar || profile.picture;
            await user.save();
        }
    } else {
        user = await User.create({
            email: profile.email,
            googleId: profile.sub,
            authProvider: "google",
            displayName: profile.name,
            avatar: profile.picture,
            role: ROLES.REFUGEE,
            status: ACCOUNT_STATUSES.ACTIVE,
        });
    }

    if (user.status === ACCOUNT_STATUSES.PENDING) {
        throw new Error("Your account is pending admin approval");
    }
    if (user.status === ACCOUNT_STATUSES.REJECTED) {
        throw new Error("Your account has been rejected");
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, token };
};

// ─── Auth0-Mediated GitHub Connection ─────────────────────────────────────────
// When a user clicks "Continue with GitHub", the backend redirects to Auth0's
// /authorize endpoint with a "connection=github" parameter. Auth0 then handles
// the GitHub OAuth flow and callback, returning the user profile and tokens.

const buildGithubAuthorizeUrl = (connection = "github") => {
    const config = getAuth0Config();
    if (!config.domain || !config.clientId || !config.redirectUri) {
        throw new Error("Auth0 configuration is incomplete");
    }

    const state = crypto.randomBytes(16).toString("hex");
    stateStore.set(state, { createdAt: Date.now() });

    const params = new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: "openid profile email",
        state,
        connection,
    });

    return { url: `${config.authorizeUrl}?${params.toString()}`, state };
};

const verifyGithubState = (state) => {
    if (!state) return false;
    const entry = stateStore.get(state);
    if (!entry) return false;
    stateStore.delete(state);
    return Date.now() - entry.createdAt < STATE_TTL_MS;
};

const findOrCreateGitHubUser = async (profile) => {
    // Profile comes from Auth0's GitHub connection
    // profile.sub is the GitHub user ID
    // profile.email, profile.name, profile.picture are from GitHub via Auth0

    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email }] });

    if (user) {
        if (user.authProvider !== "github") {
            user.authProvider = "github";
            user.googleId = profile.sub; // reuse googleId field for GitHub ID
            user.displayName = user.displayName || profile.name;
            user.avatar = user.avatar || profile.picture;
            await user.save();
        }
    } else {
        user = await User.create({
            email: profile.email,
            googleId: profile.sub, // reuse googleId field for GitHub ID
            authProvider: "github",
            displayName: profile.name,
            avatar: profile.picture,
            role: ROLES.REFUGEE,
            status: ACCOUNT_STATUSES.ACTIVE,
        });
    }

    if (user.status === ACCOUNT_STATUSES.PENDING) {
        throw new Error("Your account is pending admin approval");
    }
    if (user.status === ACCOUNT_STATUSES.REJECTED) {
        throw new Error("Your account has been rejected");
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, token };
};

// Export all functions
export { buildAuthorizeUrl, verifyState, exchangeCodeForTokens, verifyIdToken, findOrCreateOAuthUser };
export { buildGithubAuthorizeUrl, verifyGithubState, findOrCreateGitHubUser };