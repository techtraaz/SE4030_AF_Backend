import * as oauthService from "../service/oauthService.js";

const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

// Auth0 redirects back with ?error=...&error_description=... when the
// authorize request fails (e.g. audience not authorized, callback URL
// mismatch). Redirect to the frontend so the user sees a readable message
// instead of raw JSON in the address bar.
const redirectWithError = (res, error, errorDescription) => {
    const frontendUrl = getFrontendUrl();
    const params = new URLSearchParams({
        error: error || "oauth_failed",
        error_description: errorDescription || "OAuth login failed",
    });
    return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
};

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
        // Handle Auth0-denied authorize (e.g. "Client X is not authorized to
        // access resource server Y", redirect_uri mismatch, access_denied).
        if (req.query.error) {
            return redirectWithError(res, req.query.error, req.query.error_description);
        }

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

        const frontendUrl = getFrontendUrl();
        return res.redirect(
            `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`
        );
    } catch (error) {
        return res.unauthorized(error.message);
    }
};

const redirectToGithub = async (req, res) => {
    try {
        const { url } = oauthService.buildGithubAuthorizeUrl("github");
        return res.redirect(url);
    } catch (error) {
        return res.error("Failed to start GitHub login. Is Auth0 configured?");
    }
};

const handleGithubCallback = async (req, res) => {
    try {
        if (req.query.error) {
            return redirectWithError(res, req.query.error, req.query.error_description);
        }

        const { code, state } = req.query;

        if (!code || !oauthService.verifyGithubState(state)) {
            return res.badRequest("Invalid GitHub OAuth state or missing authorization code");
        }

        // Must use the same redirect_uri sent in the authorize step.
        const config = oauthService.getAuth0Config();
        const redirectUri = config.githubRedirectUri || config.redirectUri;

        // Exchange authorization code with Auth0 (not directly with GitHub)
        const tokens = await oauthService.exchangeCodeForTokens(code, redirectUri);
        if (!tokens.id_token) {
            return res.unauthorized("No ID token returned by Auth0");
        }

        // Verify the ID token with Auth0 JWKS
        const profile = await oauthService.verifyIdToken(tokens.id_token);
        const { user, token } = await oauthService.findOrCreateGitHubUser(profile);

        const frontendUrl = getFrontendUrl();
        return res.redirect(
            `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`
        );
    } catch (error) {
        return res.unauthorized(error.message);
    }
};

export { redirectToProvider, handleCallback, redirectToGithub, handleGithubCallback };
