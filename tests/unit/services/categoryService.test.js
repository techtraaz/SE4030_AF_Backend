jest.mock("../../../src/models/lesson/category.js");

import Category from "../../../src/models/lesson/category.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../../src/service/lesson/categoryService.js";

describe("categoryService", () => {
  // ─── createCategory ───────────────────────────────────────────────────────

  describe("createCategory", () => {
    it("should throw when a category with the same slug already exists", async () => {
      Category.findOne.mockResolvedValue({ slug: "existing-slug" });
      await expect(createCategory({ slug: "existing-slug", name: "Test" })).rejects.toThrow(
        "Category with this slug already exists"
      );
      expect(Category.create).not.toHaveBeenCalled();
    });

    it("should create and return a new category", async () => {
      const newCat = { _id: "cat1", slug: "new-slug", name: "New" };
      Category.findOne.mockResolvedValue(null);
      Category.create.mockResolvedValue(newCat);

      const result = await createCategory({ slug: "new-slug", name: "New" });
      expect(Category.create).toHaveBeenCalledWith({ slug: "new-slug", name: "New" });
      expect(result).toEqual(newCat);
    });
  });

  // ─── getAllCategories ──────────────────────────────────────────────────────

  describe("getAllCategories", () => {
    it("should return all categories", async () => {
      const cats = [{ name: "A" }, { name: "B" }];
      Category.find.mockResolvedValue(cats);

      const result = await getAllCategories();
      expect(Category.find).toHaveBeenCalledWith();
      expect(result).toEqual(cats);
    });
  });

  // ─── getCategoryById ──────────────────────────────────────────────────────

  describe("getCategoryById", () => {
    it("should return the category when found", async () => {
      const cat = { _id: "cat1", name: "Science" };
      Category.findById.mockResolvedValue(cat);

      const result = await getCategoryById("cat1");
      expect(result).toEqual(cat);
    });

    it("should throw 'Category not found' when not found", async () => {
      Category.findById.mockResolvedValue(null);
      await expect(getCategoryById("missing")).rejects.toThrow("Category not found");
    });
  });

  // ─── updateCategory ───────────────────────────────────────────────────────

  describe("updateCategory", () => {
    it("should update and return the category", async () => {
      const updated = { _id: "cat1", name: "Updated" };
      Category.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await updateCategory("cat1", { name: "Updated" });
      expect(Category.findByIdAndUpdate).toHaveBeenCalledWith("cat1", { name: "Updated" }, { new: true });
      expect(result).toEqual(updated);
    });

    it("should throw 'Category not found' when not found", async () => {
      Category.findByIdAndUpdate.mockResolvedValue(null);
      await expect(updateCategory("missing", {})).rejects.toThrow("Category not found");
    });
  });

  // ─── deleteCategory ───────────────────────────────────────────────────────

  describe("deleteCategory", () => {
    it("should delete and return the category", async () => {
      const cat = { _id: "cat1" };
      Category.findByIdAndDelete.mockResolvedValue(cat);

      const result = await deleteCategory("cat1");
      expect(result).toEqual(cat);
    });

    it("should throw 'Category not found' when not found", async () => {
      Category.findByIdAndDelete.mockResolvedValue(null);
      await expect(deleteCategory("missing")).rejects.toThrow("Category not found");
    });
  });
});
