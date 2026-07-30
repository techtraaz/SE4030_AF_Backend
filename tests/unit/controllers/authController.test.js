jest.mock("../../../src/service/authService.js");

import * as authService from "../../../src/service/authService.js";
import {
  signupRefugee,
  signupContributor,
  signupAdmin,
  login,
  logout,
} from "../../../src/controller/authController.js";
import { ROLES } from "../../../src/utils/constants.js";

// Factory for mock req/res
const buildReqRes = (body = {}, headers = {}) => {
  const req = { body, headers };
  const res = {
    created: jest.fn(),
    success: jest.fn(),
    badRequest: jest.fn(),
    unauthorized: jest.fn(),
  };
  return { req, res };
};

describe("authController", () => {
  // ─── signupRefugee ────────────────────────────────────────────────────────

  describe("signupRefugee", () => {
    it("should call res.created on success", async () => {
      const { req, res } = buildReqRes({ email: "r@t.com", password: "pass" });
      const user = { email: "r@t.com" };
      authService.signup.mockResolvedValue(user);

      await signupRefugee(req, res);
      expect(authService.signup).toHaveBeenCalledWith(req.body, ROLES.REFUGEE);
      expect(res.created).toHaveBeenCalledWith("Refugee registered successfully", user);
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes();
      authService.signup.mockRejectedValue(new Error("User already exists"));

      await signupRefugee(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("User already exists");
    });
  });

  // ─── signupContributor ────────────────────────────────────────────────────

  describe("signupContributor", () => {
    it("should call res.created with pending message on success", async () => {
      const { req, res } = buildReqRes({ email: "c@t.com", password: "pass" });
      authService.signup.mockResolvedValue({ email: "c@t.com" });

      await signupContributor(req, res);
      expect(authService.signup).toHaveBeenCalledWith(req.body, ROLES.CONTENT_CONTRIBUTOR);
      expect(res.created).toHaveBeenCalledWith(
        "Registration submitted. Please wait for admin approval before logging in.",
        expect.any(Object)
      );
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes();
      authService.signup.mockRejectedValue(new Error("Email taken"));

      await signupContributor(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("Email taken");
    });
  });

  // ─── signupAdmin ──────────────────────────────────────────────────────────

  describe("signupAdmin", () => {
    it("should call res.created on success", async () => {
      const { req, res } = buildReqRes({ email: "a@t.com", password: "pass" });
      authService.signup.mockResolvedValue({ email: "a@t.com" });

      await signupAdmin(req, res);
      expect(authService.signup).toHaveBeenCalledWith(req.body, ROLES.ADMIN);
      expect(res.created).toHaveBeenCalledWith("Admin registered successfully", expect.any(Object));
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes();
      authService.signup.mockRejectedValue(new Error("Conflict"));

      await signupAdmin(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("Conflict");
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("should call res.success on successful login", async () => {
      const { req, res } = buildReqRes({ email: "u@t.com", password: "pass" });
      const result = { user: { email: "u@t.com" }, token: "tok" };
      authService.login.mockResolvedValue(result);

      await login(req, res);
      expect(res.success).toHaveBeenCalledWith("Login successful", result);
    });

    it("should call res.unauthorized on login failure", async () => {
      const { req, res } = buildReqRes();
      authService.login.mockRejectedValue(new Error("Invalid credentials"));

      await login(req, res);
      expect(res.unauthorized).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe("logout", () => {
    it("should call res.success on successful logout", async () => {
      const { req, res } = buildReqRes({}, { authorization: "Bearer my-token" });
      authService.logout.mockResolvedValue(undefined);

      await logout(req, res);
      expect(authService.logout).toHaveBeenCalledWith("my-token");
      expect(res.success).toHaveBeenCalledWith("Logged out successfully");
    });

    it("should call res.badRequest on logout error", async () => {
      const { req, res } = buildReqRes({}, { authorization: "Bearer bad-token" });
      authService.logout.mockRejectedValue(new Error("Invalid token"));

      await logout(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("Invalid token");
    });
  });
});
