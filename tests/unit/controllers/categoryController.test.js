jest.mock("../../../src/service/lesson/categoryService.js");

import * as categoryService from "../../../src/service/lesson/categoryService.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../../src/controller/lesson/categoryController.js";

const buildReqRes = ({ body = {}, params = {} } = {}) => {
  const req = { body, params };
  const res = {
    created: jest.fn(),
    success: jest.fn(),
    badRequest: jest.fn(),
    notFound: jest.fn(),
    error: jest.fn(),
  };
  return { req, res };
};

describe("categoryController", () => {
  // ─── createCategory ───────────────────────────────────────────────────────

  describe("createCategory", () => {
    it("should call res.created on success", async () => {
      const { req, res } = buildReqRes({ body: { name: "Grammar", slug: "grammar" } });
      const cat = { _id: "c1", name: "Grammar" };
      categoryService.createCategory.mockResolvedValue(cat);

      await createCategory(req, res);
      expect(categoryService.createCategory).toHaveBeenCalledWith(req.body);
      expect(res.created).toHaveBeenCalledWith("Category created successfully", cat);
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes();
      categoryService.createCategory.mockRejectedValue(new Error("Slug taken"));

      await createCategory(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("Slug taken");
    });
  });

  // ─── getAllCategories ──────────────────────────────────────────────────────

  describe("getAllCategories", () => {
    it("should call res.success with the category list", async () => {
      const { req, res } = buildReqRes();
      const categories = [{ name: "A" }, { name: "B" }];
      categoryService.getAllCategories.mockResolvedValue(categories);

      await getAllCategories(req, res);
      expect(res.success).toHaveBeenCalledWith("Categories fetched successfully", categories);
    });

    it("should call res.error on failure", async () => {
      const { req, res } = buildReqRes();
      categoryService.getAllCategories.mockRejectedValue(new Error("DB error"));

      await getAllCategories(req, res);
      expect(res.error).toHaveBeenCalledWith("DB error");
    });
  });

  // ─── getCategoryById ──────────────────────────────────────────────────────

  describe("getCategoryById", () => {
    it("should call res.success when found", async () => {
      const { req, res } = buildReqRes({ params: { id: "c1" } });
      const cat = { _id: "c1", name: "Science" };
      categoryService.getCategoryById.mockResolvedValue(cat);

      await getCategoryById(req, res);
      expect(categoryService.getCategoryById).toHaveBeenCalledWith("c1");
      expect(res.success).toHaveBeenCalledWith("Category fetched successfully", cat);
    });

    it("should call res.notFound on error", async () => {
      const { req, res } = buildReqRes({ params: { id: "missing" } });
      categoryService.getCategoryById.mockRejectedValue(new Error("Category not found"));

      await getCategoryById(req, res);
      expect(res.notFound).toHaveBeenCalledWith("Category not found");
    });
  });

  // ─── updateCategory ───────────────────────────────────────────────────────

  describe("updateCategory", () => {
    it("should call res.success on successful update", async () => {
      const { req, res } = buildReqRes({ params: { id: "c1" }, body: { name: "Updated" } });
      const updated = { _id: "c1", name: "Updated" };
      categoryService.updateCategory.mockResolvedValue(updated);

      await updateCategory(req, res);
      expect(categoryService.updateCategory).toHaveBeenCalledWith("c1", { name: "Updated" });
      expect(res.success).toHaveBeenCalledWith("Category updated successfully", updated);
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes({ params: { id: "c1" } });
      categoryService.updateCategory.mockRejectedValue(new Error("Not found"));

      await updateCategory(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("Not found");
    });
  });

  // ─── deleteCategory ───────────────────────────────────────────────────────

  describe("deleteCategory", () => {
    it("should call res.success with null on success", async () => {
      const { req, res } = buildReqRes({ params: { id: "c1" } });
      categoryService.deleteCategory.mockResolvedValue({ _id: "c1" });

      await deleteCategory(req, res);
      expect(categoryService.deleteCategory).toHaveBeenCalledWith("c1");
      expect(res.success).toHaveBeenCalledWith("Category deleted successfully", null);
    });

    it("should call res.notFound on error", async () => {
      const { req, res } = buildReqRes({ params: { id: "missing" } });
      categoryService.deleteCategory.mockRejectedValue(new Error("Category not found"));

      await deleteCategory(req, res);
      expect(res.notFound).toHaveBeenCalledWith("Category not found");
    });
  });
});
