
import * as categoryService from "../../service/lesson/categoryService.js";

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        return res.created("Category created successfully", category);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        return res.success("Categories fetched successfully", categories);
    } catch (error) {
        return res.error(error.message);
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        return res.success("Category fetched successfully", category);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        return res.success("Category updated successfully", category);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        return res.success("Category deleted successfully", null);
    } catch (error) {
        return res.notFound(error.message);
    }
};


export { createCategory , getAllCategories , getCategoryById , updateCategory , deleteCategory}