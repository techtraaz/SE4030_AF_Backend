jest.mock("../../../src/models/auth/user.js");

import jwt from "jsonwebtoken";
import User from "../../../src/models/auth/user.js";
import {
  buildAuthorizeUrl,
  verifyState,
  exchangeCodeForTokens,
  findOrCreateOAuthUser,
} from "../../../src/service/oauthService.js";

const OLD_ENV = process.env;

beforeAll(() => {
  process.env = {
    ...OLD_ENV,
    AUTH0_DOMAIN: "dev-test.us.auth0.com",
    AUTH0_CLIENT_ID: "test-client-id",
    AUTH0_CLIENT_SECRET: "test-client-secret",
    AUTH0_REDIRECT_URI: "http://localhost:5000/api/auth/google/callback",
    JWT_SECRET: "test_secret_key",
  };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe("buildAuthorizeUrl", () => {
  it("should return an Auth0 authorize URL with required params and a state", () => {
    const { url, state } = buildAuthorizeUrl();

    const parsed = new URL(url);
    expect(parsed.origin).toBe("https://dev-test.us.auth0.com");
    expect(parsed.pathname).toBe("/authorize");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("client_id")).toBe("test-client-id");
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "http://localhost:5000/api/auth/google/callback"
    );
    expect(parsed.searchParams.get("scope")).toContain("openid");
    expect(parsed.searchParams.get("state")).toBe(state);
    expect(state).toHaveLength(32);
  });
});

describe("verifyState", () => {
  it("should accept a state issued by buildAuthorizeUrl", () => {
    const { state } = buildAuthorizeUrl();
    expect(verifyState(state)).toBe(true);
  });

  it("should reject a state that was not issued", () => {
    expect(verifyState("forged-state")).toBe(false);
  });

  it("should only allow a state to be used once", () => {
    const { state } = buildAuthorizeUrl();
    expect(verifyState(state)).toBe(true);
    expect(verifyState(state)).toBe(false);
  });
});

describe("exchangeCodeForTokens", () => {
  it("should POST the code to the Auth0 token endpoint and return tokens", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ access_token: "at", id_token: "idt" }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await exchangeCodeForTokens("the-code");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("https://dev-test.us.auth0.com/oauth/token");
    expect(options.method).toBe("POST");
    expect(options.body.toString()).toContain("grant_type=authorization_code");
    expect(options.body.toString()).toContain("client_id=test-client-id");
    expect(options.body.toString()).toContain("code=the-code");
    expect(result.access_token).toBe("at");
  });

  it("should throw when the token endpoint returns an error", async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        error: "invalid_grant",
        error_description: "Bad code",
      }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await expect(exchangeCodeForTokens("bad-code")).rejects.toThrow("Bad code");
  });
});

describe("findOrCreateOAuthUser", () => {
  it("should create a new user when none exists and return an app JWT", async () => {
    const mockUser = {
      _id: "new-user-id",
      email: "new@test.com",
      role: "REFUGEE",
      status: "ACTIVE",
      authProvider: "google",
      googleId: "google-sub",
      toObject: () => ({
        _id: "new-user-id",
        email: "new@test.com",
        role: "REFUGEE",
        status: "ACTIVE",
        authProvider: "google",
        password: "hashed",
      }),
    };

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser);

    const profile = {
      sub: "google-sub",
      email: "new@test.com",
      name: "New User",
      picture: "http://pic",
      email_verified: true,
    };

    const { user, token } = await findOrCreateOAuthUser(profile);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@test.com",
        googleId: "google-sub",
        role: "REFUGEE",
        status: "ACTIVE",
      })
    );
    expect(user).not.toHaveProperty("password");

    const decoded = jwt.verify(token, "test_secret_key");
    expect(decoded.id).toBe("new-user-id");
  });

  it("should link googleId to an existing local user with the same email", async () => {
    const mockUser = {
      _id: "existing-id",
      email: "exists@test.com",
      role: "REFUGEE",
      status: "ACTIVE",
      googleId: null,
      authProvider: "local",
      save: jest.fn(),
      toObject: () => ({
        _id: "existing-id",
        email: "exists@test.com",
        role: "REFUGEE",
        status: "ACTIVE",
      }),
    };

    User.findOne.mockResolvedValue(mockUser);

    const profile = {
      sub: "google-sub",
      email: "exists@test.com",
      name: "Existing",
      picture: "http://pic",
      email_verified: true,
    };

    const { user } = await findOrCreateOAuthUser(profile);

    expect(User.create).not.toHaveBeenCalled();
    expect(mockUser.googleId).toBe("google-sub");
    expect(mockUser.save).toHaveBeenCalled();
    expect(user).not.toHaveProperty("password");
  });

  it("should reject users with unverified email", async () => {
    await expect(
      findOrCreateOAuthUser({
        sub: "google-sub",
        email: "x@test.com",
        email_verified: false,
      })
    ).rejects.toThrow("email is not verified");
  });

  it("should throw when the account status is pending", async () => {
    const mockUser = {
      _id: "pending-id",
      email: "p@test.com",
      role: "CONTENT_CONTRIBUTOR",
      status: "PENDING",
      googleId: "g",
      authProvider: "google",
      toObject: () => ({}),
    };
    User.findOne.mockResolvedValue(mockUser);

    await expect(
      findOrCreateOAuthUser({
        sub: "g",
        email: "p@test.com",
        email_verified: true,
      })
    ).rejects.toThrow("pending admin approval");
  });
});