import request from "supertest";
import express from "express";
import { authLimiter, generalLimiter } from "../../../src/middleware/rateLimiter.js";

describe("rate limiting middleware", () => {
  let app;
  let server;

  beforeAll(() => {
    app = express();
    app.get("/limited", generalLimiter, (req, res) =>
      res.status(200).json({ ok: true }),
    );
    app.post("/auth/login", authLimiter, (req, res) =>
      res.status(200).json({ ok: true }),
    );
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("generalLimiter", () => {
    it("allows up to 100 requests then returns 429", async () => {
      for (let i = 0; i < 100; i++) {
        const res = await request(server).get("/limited");
        expect(res.statusCode).toBe(200);
      }

      const res = await request(server).get("/limited");
      expect(res.statusCode).toBe(429);
      expect(res.body).toEqual({
        code: 429,
        message: "Too many requests. Please try again later.",
      });
    });
  });

  describe("authLimiter", () => {
    it("allows up to 10 requests then returns 429", async () => {
      for (let i = 0; i < 10; i++) {
        const res = await request(server).post("/auth/login");
        expect(res.statusCode).toBe(200);
      }

      const res = await request(server).post("/auth/login");
      expect(res.statusCode).toBe(429);
      expect(res.body).toEqual({
        code: 429,
        message: "Too many authentication attempts. Please try again later.",
      });
    });
  });
});
