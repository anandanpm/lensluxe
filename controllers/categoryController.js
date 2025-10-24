const Category = require('../model/categorySchema');
const Product = require("../model/productSchema");
const { SUCCESS_MESSAGES, ERROR_MESSAGES, VALIDATION_MESSAGES } = require('../config/constants');

const categoryGet = async (req, res) => {
    try {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1; 

        // Get total number of categories
        const totalCategories = await Category.countDocuments({ deleted: false });
        const totalPages = Math.ceil(totalCategories / perPage);

        // Get categories for the current page
        const category = await Category.find({ deleted: false })
            .sort({ createdAt: -1 }) 
            .skip((page - 1) * perPage) 
            .limit(perPage); 

        // Render the category page
        res.render('category', { category, currentPage: page, totalPages });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading categories');
    }
};

const addcategoryPost = async (req, res) => {
    try {
        const { name, status } = req.body;
        
        // Validate category name
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: ERROR_MESSAGES.CATEGORY_NAME_EMPTY });
        }
        
        const trimmedName = name.trim();
        
        // Validate name length
        if (trimmedName.length < 3) {
            return res.status(400).json({ error: VALIDATION_MESSAGES.CATEGORY_NAME_MIN_LENGTH });
        }
        
        if (trimmedName.length > 50) {
            return res.status(400).json({ error: VALIDATION_MESSAGES.CATEGORY_NAME_MAX_LENGTH });
        }

        const cat_name = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

        const catFound = await Category.findOne({
            name: { $regex: new RegExp(`^${cat_name}$`, "i") },
        });
 
        if (catFound) {
            if (catFound.deleted == true) {
                catFound.deleted = false;
                catFound.status = status;
                await catFound.save();
                console.log(SUCCESS_MESSAGES.CATEGORY_REACTIVATED, catFound);
            } else {
                return res.status(400).json({ error: ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS });
            }
        } else {
            const newCategory = new Category({
                name: cat_name,
                status
            });
            await newCategory.save();
            console.log(SUCCESS_MESSAGES.CATEGORY_ADDED, newCategory);
        }

        res.redirect('/admin/category');
    } catch (error) {
        console.log("Error occurred: ", error);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

const updatecategoryPost = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, status } = req.body;
        
        // Validate category name
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: ERROR_MESSAGES.CATEGORY_NAME_EMPTY });
        }
        
        const trimmedName = name.trim();
        
        // Validate name length
        if (trimmedName.length < 3) {
            return res.status(400).json({ error: VALIDATION_MESSAGES.CATEGORY_NAME_MIN_LENGTH });
        }
        
        if (trimmedName.length > 50) {
            return res.status(400).json({ error: VALIDATION_MESSAGES.CATEGORY_NAME_MAX_LENGTH });
        }
        
        const cat_name = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
        
        // Check for duplicate category name (excluding current category)
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${cat_name}$`, "i") },
            _id: { $ne: categoryId },
            deleted: false
        });
        
        if (existingCategory) {
            return res.status(400).json({ error: ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS });
        }

        const updateCategory = await Category.findByIdAndUpdate(
            categoryId, 
            { name: cat_name, status }, 
            { new: true }
        );

        if (!updateCategory) {
            return res.status(404).json({ error: ERROR_MESSAGES.CATEGORY_NOT_FOUND });
        }
        
        res.status(200).json({ success: true, message: SUCCESS_MESSAGES.CATEGORY_UPDATED });
    } catch (error) {
        console.log('Error Occurred: ', error);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

const deletecategoryPost = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        category.deleted = true;
        await category.save();
        res.redirect('/admin/category')
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        res.render('pagenotfound')
    }
};






module.exports = {
categoryGet,
addcategoryPost,
updatecategoryPost,
deletecategoryPost,


}