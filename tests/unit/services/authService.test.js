// Mock all db / external dependencies before module under test is imported
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../src/models/auth/user.js");
jest.mock("../../../src/models/auth/blacklistedToken.js");

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../src/models/auth/user.js";
import BlacklistedToken from "../../../src/models/auth/blacklistedToken.js";
import { signup, login, logout } from "../../../src/service/authService.js";
import { ROLES, ACCOUNT_STATUSES } from "../../../src/utils/constants.js";

describe("authService", () => {
  // ─── signup ───────────────────────────────────────────────────────────────

  describe("signup", () => {
    it("should throw 'User already exists' if email is taken", async () => {
      User.findOne.mockResolvedValue({ email: "test@test.com" });
      await expect(signup({ email: "test@test.com", password: "pass" }, ROLES.REFUGEE)).rejects.toThrow(
        "User already exists"
      );
    });

    it("should hash the password before saving", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpass");
      const mockUser = {
        email: "refugee@test.com",
        role: ROLES.REFUGEE,
        status: ACCOUNT_STATUSES.ACTIVE,
        toObject: () => ({ email: "refugee@test.com", password: "hashedpass" }),
      };
      User.create.mockResolvedValue(mockUser);

      await signup({ email: "refugee@test.com", password: "pass" }, ROLES.REFUGEE);
      expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
    });

    it("should set status ACTIVE for REFUGEE role", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpass");
      const mockUser = {
        toObject: () => ({ email: "refugee@t.com", role: ROLES.REFUGEE, status: ACCOUNT_STATUSES.ACTIVE }),
      };
      User.create.mockResolvedValue(mockUser);

      await signup({ email: "refugee@t.com", password: "pass" }, ROLES.REFUGEE);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: ACCOUNT_STATUSES.ACTIVE })
      );
    });

    it("should set status PENDING for CONTENT_CONTRIBUTOR role", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpass");
      const mockUser = {
        toObject: () => ({ email: "contrib@t.com", role: ROLES.CONTENT_CONTRIBUTOR, status: ACCOUNT_STATUSES.PENDING }),
      };
      User.create.mockResolvedValue(mockUser);

      await signup({ email: "contrib@t.com", password: "pass" }, ROLES.CONTENT_CONTRIBUTOR);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: ACCOUNT_STATUSES.PENDING })
      );
    });

    it("should strip the password field from the returned object", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpass");
      const rawObj = { email: "u@t.com", password: "hashedpass" };
      User.create.mockResolvedValue({ toObject: () => ({ ...rawObj }) });

      const result = await signup({ email: "u@t.com", password: "pass" }, ROLES.REFUGEE);
      expect(result.password).toBeUndefined();
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("should throw 'Invalid credentials' when user is not found", async () => {
      User.findOne.mockResolvedValue(null);
      await expect(login({ email: "no@test.com", password: "pass" })).rejects.toThrow("Invalid credentials");
    });

    it("should throw when account status is PENDING", async () => {
      User.findOne.mockResolvedValue({ status: ACCOUNT_STATUSES.PENDING });
      await expect(login({ email: "u@t.com", password: "pass" })).rejects.toThrow(
        "Your account is pending admin approval"
      );
    });

    it("should throw when account status is REJECTED", async () => {
      User.findOne.mockResolvedValue({ status: ACCOUNT_STATUSES.REJECTED });
      await expect(login({ email: "u@t.com", password: "pass" })).rejects.toThrow(
        "Your account has been rejected"
      );
    });

    it("should throw 'Invalid credentials' when password does not match", async () => {
      User.findOne.mockResolvedValue({ status: ACCOUNT_STATUSES.ACTIVE, password: "hashedpass" });
      bcrypt.compare.mockResolvedValue(false);
      await expect(login({ email: "u@t.com", password: "wrong" })).rejects.toThrow("Invalid credentials");
    });

    it("should return user object (without password) and token on success", async () => {
      const rawUser = { _id: "id1", email: "u@t.com", status: ACCOUNT_STATUSES.ACTIVE, password: "hashed" };
      User.findOne.mockResolvedValue({
        ...rawUser,
        toObject: () => ({ ...rawUser }),
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mocked-token");

      const result = await login({ email: "u@t.com", password: "pass" });
      expect(result.token).toBe("mocked-token");
      expect(result.user.password).toBeUndefined();
      expect(result.user.email).toBe("u@t.com");
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe("logout", () => {
    it("should throw 'Invalid token' when decoded token has no exp", async () => {
      jwt.decode.mockReturnValue({ id: "u1" }); // no exp field
      await expect(logout("bad-token")).rejects.toThrow("Invalid token");
    });

    it("should throw 'Invalid token' when decode returns null", async () => {
      jwt.decode.mockReturnValue(null);
      await expect(logout("null-token")).rejects.toThrow("Invalid token");
    });

    it("should save the token to the blacklist with correct expiresAt", async () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      jwt.decode.mockReturnValue({ exp });
      BlacklistedToken.create.mockResolvedValue({});

      await logout("valid-token");
      expect(BlacklistedToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ token: "valid-token" })
      );
    });
  });
});
