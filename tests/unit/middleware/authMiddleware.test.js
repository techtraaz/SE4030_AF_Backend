// Mock all external dependencies before importing the module under test
jest.mock("jsonwebtoken");
jest.mock("../../../src/models/auth/user.js");
jest.mock("../../../src/models/auth/blacklistedToken.js");

import jwt from "jsonwebtoken";
import User from "../../../src/models/auth/user.js";
import BlacklistedToken from "../../../src/models/auth/blacklistedToken.js";
import {
  authenticate,
  authorizeAdmin,
  authorizeRefugee,
  authorizeContentContributor,
  authorizeRoles,
} from "../../../src/middleware/authMiddleware.js";

// Helper to build a mock res with all response helpers
const buildRes = () => {
  const res = {};
  res.unauthorized = jest.fn().mockReturnValue(res);
  res.forbidden = jest.fn().mockReturnValue(res);
  return res;
};

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = buildRes();
    next = jest.fn();
  });

  // ─── authenticate ─────────────────────────────────────────────────────────

  describe("authenticate", () => {
    it("should return 401 when no authorization header is present", async () => {
      await authenticate(req, res, next);
      expect(res.unauthorized).toHaveBeenCalledWith("No token provided");
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when the token is blacklisted", async () => {
      req.headers.authorization = "Bearer blacklisted-token";
      jwt.verify.mockReturnValue({ id: "user123" });
      BlacklistedToken.findOne.mockResolvedValue({ token: "blacklisted-token" });

      await authenticate(req, res, next);
      expect(res.unauthorized).toHaveBeenCalledWith("Token has been invalidated. Please login again");
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not found", async () => {
      req.headers.authorization = "Bearer valid-token";
      jwt.verify.mockReturnValue({ id: "user123" });
      BlacklistedToken.findOne.mockResolvedValue(null);
      User.findById.mockResolvedValue(null);

      await authenticate(req, res, next);
      expect(res.unauthorized).toHaveBeenCalledWith("Invalid or inactive user");
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when user account is not ACTIVE", async () => {
      req.headers.authorization = "Bearer valid-token";
      jwt.verify.mockReturnValue({ id: "user123" });
      BlacklistedToken.findOne.mockResolvedValue(null);
      User.findById.mockResolvedValue({ status: "PENDING" });

      await authenticate(req, res, next);
      expect(res.unauthorized).toHaveBeenCalledWith("Invalid or inactive user");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() and attach user to req when token is valid", async () => {
      const mockUser = { _id: "user123", status: "ACTIVE", role: "REFUGEE" };
      req.headers.authorization = "Bearer valid-token";
      jwt.verify.mockReturnValue({ id: "user123" });
      BlacklistedToken.findOne.mockResolvedValue(null);
      User.findById.mockResolvedValue(mockUser);

      await authenticate(req, res, next);
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 401 when jwt.verify throws", async () => {
      req.headers.authorization = "Bearer bad-token";
      jwt.verify.mockImplementation(() => { throw new Error("invalid"); });

      await authenticate(req, res, next);
      expect(res.unauthorized).toHaveBeenCalledWith("Invalid token");
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ─── authorizeAdmin ────────────────────────────────────────────────────────

  describe("authorizeAdmin", () => {
    it("should return 403 when user is not ADMIN", () => {
      req.user = { role: "REFUGEE" };
      authorizeAdmin(req, res, next);
      expect(res.forbidden).toHaveBeenCalledWith("Admin access required");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() when user is ADMIN", () => {
      req.user = { role: "ADMIN" };
      authorizeAdmin(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ─── authorizeRefugee ─────────────────────────────────────────────────────

  describe("authorizeRefugee", () => {
    it("should return 403 when user is not REFUGEE", () => {
      req.user = { role: "ADMIN" };
      authorizeRefugee(req, res, next);
      expect(res.forbidden).toHaveBeenCalledWith("Refugee access required");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() when user is REFUGEE", () => {
      req.user = { role: "REFUGEE" };
      authorizeRefugee(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ─── authorizeContentContributor ──────────────────────────────────────────

  describe("authorizeContentContributor", () => {
    it("should return 403 when user is not CONTENT_CONTRIBUTOR", () => {
      req.user = { role: "REFUGEE" };
      authorizeContentContributor(req, res, next);
      expect(res.forbidden).toHaveBeenCalledWith("Content Contributor access required");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() when user is CONTENT_CONTRIBUTOR", () => {
      req.user = { role: "CONTENT_CONTRIBUTOR" };
      authorizeContentContributor(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ─── authorizeRoles ───────────────────────────────────────────────────────

  describe("authorizeRoles", () => {
    it("should return 403 when user role is not in allowed list", () => {
      req.user = { role: "REFUGEE" };
      authorizeRoles("ADMIN", "CONTENT_CONTRIBUTOR")(req, res, next);
      expect(res.forbidden).toHaveBeenCalledWith("Access denied");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() when user role is in allowed list", () => {
      req.user = { role: "ADMIN" };
      authorizeRoles("ADMIN", "CONTENT_CONTRIBUTOR")(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
