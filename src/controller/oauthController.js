import * as oauthService from "../service/oauthService.js";

const redirectToProvider = async (req, res) => {
    try {
        const { url } = oauthService.buildAuthorizeUrl();
        return res.redirect(url);
    } catch (error) {
        return res.error("Failed to start OAuth login. Is Auth0 configured?");
    }
};

const handleCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code || !oauthService.verifyState(state)) {
            return res.badRequest("Invalid OAuth state or missing authorization code");
        }

        const tokens = await oauthService.exchangeCodeForTokens(code);
        if (!tokens.id_token) {
            return res.unauthorized("No ID token returned by the OAuth provider");
        }

        const profile = await oauthService.verifyIdToken(tokens.id_token);
        const { user, token } = await oauthService.findOrCreateOAuthUser(profile);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
            `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`
        );
    } catch (error) {
        return res.unauthorized(error.message);
    }
};

export { redirectToProvider, handleCallback };