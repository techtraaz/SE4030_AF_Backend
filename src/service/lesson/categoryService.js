
import Category from "../../models/lesson/category.js";

const createCategory = async (data) => {
    const existing = await Category.findOne({ slug: data.slug });
    if (existing) throw new Error("Category with this slug already exists");
    const category = await Category.create(data);
    return category;
};

const getAllCategories = async () => {
    return await Category.find();
};

const getCategoryById = async (id) => {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
};

const updateCategory = async (id, data) => {
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new Error("Category not found");
    return category;
};

const deleteCategory = async (id) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new Error("Category not found");
    return category;
};

export { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };