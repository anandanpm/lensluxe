
const Category = require('../model/categorySchema');
const Product = require("../model/productSchema");

const categoryGet = async (req, res) => {
    try {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1; 

       
        const totalCategories = await Category.countDocuments({ deleted: false });
        const totalPages = Math.ceil(totalCategories / perPage);

        
        const category = await Category.find({ deleted: false })
            .sort({ createdAt: -1 }) 
            .skip((page - 1) * perPage) 
            .limit(perPage); 

        
        res.render('category', { category, currentPage: page, totalPages });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading categories');
    }
};




// const addcategoryPost = async (req, res) => {
//     try {
//         const { name, status } = req.body;
//         console.log(name ,status)
     
//         const cat_name =
//             name.charAt(0).toUpperCase() +
//             name.slice(1).toLowerCase();

//         const catFound = await Category.findOne({
//             name: { $regex: new RegExp(`^${cat_name}$`, "i") }, 
//         });

//         if (!catFound) {
//             const newCategory = new Category({
//                 name: cat_name,
//                 status
//             });
//             await newCategory.save();
//         }

//         res.redirect('/admin/category');
//     } catch (error) {
//         console.log("Error occurred: ", error);
//         res.render('pagenotfound')
//     }
// }
const addcategoryPost = async (req, res) => {
    try {
        const { name, status } = req.body;
        console.log("Received data:", name, status);

        const cat_name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        console.log("Formatted category name:", cat_name);

        const catFound = await Category.findOne({
            name: { $regex: new RegExp(`^${cat_name}$`, "i") },
        });
 
        if (catFound) {
            
            if (catFound.deleted == true) {
                catFound.deleted = false
                await catFound.save();
                console.log("Category reactivated:", catFound);
            } else {
                console.log("Category already exists and is active:", catFound);
            }
        } else {
          
            const newCategory = new Category({
                name: cat_name,
                status
            });
            await newCategory.save();
            console.log("New category saved:", newCategory);
        }

        res.redirect('/admin/category');
    } catch (error) {
        console.log("Error occurred: ", error);
        res.render('pagenotfound');
    }
};



const updatecategoryPost = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, status } = req.body;

        const updateCategory = await Category.findByIdAndUpdate(categoryId, { name, status }, { new: true });

        if (!updateCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        console.log("start")
        res.status(200).json({ success: true });
        console.log("finish")
    } catch (error) {
        console.log('Error Occurred: ', error);
        res.status(500).send('Internal Server Error'); // Send appropriate error response
        res.render('pagenotfound')
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


// const uniquecategory = async (req, res) => {
    
//         try {
//             const categoryId = req.query.categoryId;
//         console.log(categoryId, 'goodmorning');
      
//       const category = await Category.findOne({ _id: categoryId, deleted: false });
  
//       if (!category) {
//         return res.status(404).json({ error: 'Category not found or deleted' });
//       }
  
     
//       const products = await Product.find({
//         category: categoryId,
//         status: 'active', 
//       });
//       console.log(products, 'loiuretrr');
//       res.json(products);

//         } catch (error) {
//             console.error('Search error:', error);
//             res.status(500).json({ error: 'An error occurred while searching for products' });
//         }
//     };




module.exports = {
categoryGet,
addcategoryPost,
updatecategoryPost,
deletecategoryPost,
// uniquecategory

}