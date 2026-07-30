import responseGenerator from "../../../src/middleware/responseGenerator.js";

describe("responseGenerator middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should attach helper methods to res and call next()", () => {
    responseGenerator(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(typeof res.success).toBe("function");
    expect(typeof res.created).toBe("function");
    expect(typeof res.badRequest).toBe("function");
    expect(typeof res.unauthorized).toBe("function");
    expect(typeof res.forbidden).toBe("function");
    expect(typeof res.notFound).toBe("function");
    expect(typeof res.conflict).toBe("function");
    expect(typeof res.error).toBe("function");
  });

  describe("res.success", () => {
    it("should respond with status 200 and the given message and content", () => {
      responseGenerator(req, res, next);
      res.success("OK", { data: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ code: 200, message: "OK", content: { data: 1 } });
    });

    it("should use default message and null content when called with no args", () => {
      responseGenerator(req, res, next);
      res.success();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ code: 200, message: "Success", content: null });
    });
  });

  describe("res.created", () => {
    it("should respond with status 201", () => {
      responseGenerator(req, res, next);
      res.created("Created!", { id: "abc" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ code: 201, message: "Created!", content: { id: "abc" } });
    });
  });

  describe("res.badRequest", () => {
    it("should respond with status 400", () => {
      responseGenerator(req, res, next);
      res.badRequest("Bad input");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ code: 400, message: "Bad input", content: null });
    });
  });

  describe("res.unauthorized", () => {
    it("should respond with status 401", () => {
      responseGenerator(req, res, next);
      res.unauthorized("No token");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ code: 401, message: "No token", content: null });
    });
  });

  describe("res.forbidden", () => {
    it("should respond with status 403", () => {
      responseGenerator(req, res, next);
      res.forbidden("Access denied");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ code: 403, message: "Access denied", content: null });
    });
  });

  describe("res.notFound", () => {
    it("should respond with status 404", () => {
      responseGenerator(req, res, next);
      res.notFound("Not found");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ code: 404, message: "Not found", content: null });
    });
  });

  describe("res.conflict", () => {
    it("should respond with status 409", () => {
      responseGenerator(req, res, next);
      res.conflict("Conflict");
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ code: 409, message: "Conflict", content: null });
    });
  });

  describe("res.error", () => {
    it("should respond with status 500", () => {
      responseGenerator(req, res, next);
      res.error("Server crashed");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ code: 500, message: "Server crashed", content: null });
    });
  });
});
