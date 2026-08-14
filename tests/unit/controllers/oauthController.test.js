jest.mock("../../../src/service/oauthService.js");

import * as oauthService from "../../../src/service/oauthService.js";
import {
  redirectToProvider,
  handleCallback,
} from "../../../src/controller/oauthController.js";

describe("oauthController", () => {
  describe("redirectToProvider", () => {
    it("should redirect to the Auth0 authorize URL", async () => {
      const req = {};
      const res = { redirect: jest.fn(), error: jest.fn() };

      oauthService.buildAuthorizeUrl.mockReturnValue({
        url: "https://auth0.com/authorize?x=1",
        state: "s",
      });

      await redirectToProvider(req, res);
      expect(res.redirect).toHaveBeenCalledWith("https://auth0.com/authorize?x=1");
    });

    it("should call res.error when Auth0 is not configured", async () => {
      const req = {};
      const res = { redirect: jest.fn(), error: jest.fn() };

      oauthService.buildAuthorizeUrl.mockImplementation(() => {
        throw new Error("Auth0 configuration is incomplete");
      });

      await redirectToProvider(req, res);
      expect(res.error).toHaveBeenCalled();
    });
  });

  describe("handleCallback", () => {
    it("should reject a request with an invalid state", async () => {
      const req = { query: { code: "c", state: "forged" } };
      const res = { badRequest: jest.fn(), redirect: jest.fn(), unauthorized: jest.fn() };

      oauthService.verifyState.mockReturnValue(false);

      await handleCallback(req, res);
      expect(res.badRequest).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it("should exchange the code, create the user and redirect to the frontend with a token", async () => {
      const req = { query: { code: "c", state: "valid" } };
      const res = { badRequest: jest.fn(), redirect: jest.fn(), unauthorized: jest.fn() };

      oauthService.verifyState.mockReturnValue(true);
      oauthService.exchangeCodeForTokens.mockResolvedValue({ id_token: "idt" });
      oauthService.verifyIdToken.mockResolvedValue({ sub: "g", email: "u@t.com" });
      oauthService.findOrCreateOAuthUser.mockResolvedValue({
        user: { id: "u", role: "REFUGEE" },
        token: "app-jwt",
      });

      process.env.FRONTEND_URL = "http://localhost:5173";

      await handleCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringMatching(/^http:\/\/localhost:5173\/auth\/callback\?token=/)
      );
      expect(res.unauthorized).not.toHaveBeenCalled();
    });

    it("should call res.unauthorized when the provider rejects the code", async () => {
      const req = { query: { code: "bad", state: "valid" } };
      const res = { badRequest: jest.fn(), redirect: jest.fn(), unauthorized: jest.fn() };

      oauthService.verifyState.mockReturnValue(true);
      oauthService.exchangeCodeForTokens.mockRejectedValue(new Error("invalid_grant"));

      await handleCallback(req, res);
      expect(res.unauthorized).toHaveBeenCalledWith("invalid_grant");
    });
  });
});