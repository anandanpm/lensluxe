const Product = require("../model/productSchema");
const Category = require('../model/categorySchema');
const User = require('../model/userSchema')
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/productimages');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'croppedImages') {
            cb(null, true);
        } else {
            cb(new Error('Unexpected field'));
        }
    }
}).array('croppedImages', 10); // Adjust the limit as needed

const addProduct =  async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                console.log('Multer error:', err);
                res.status(500).send('Error uploading images');
                return;
            } else if (err) {
                console.log('Unknown error:', err);
                res.status(500).send('Unknown error occurred');
                return;
            }

            if (!req.files || req.files.length === 0) {
                res.status(400).send('No images uploaded');
                return;
            }

            try {
                const imagePromises = req.files.map(async file => {
                    const imageBuffer = await sharp(file.path)
                        .resize(1500, 750)
                        .toBuffer();

                    const filename = `cropped_${Date.now()}-${file.originalname}`;
                    const imagePath = path.join(__dirname, '..', 'public', 'productimages', filename);

                    fs.writeFileSync(imagePath, imageBuffer);
                    fs.unlinkSync(file.path);

                    return filename;
                });

                const imageFilenames = await Promise.all(imagePromises);

                const newProduct = new Product({
                    name: req.body.name,
                    description: req.body.description,
                    images: imageFilenames, 
                    price: req.body.price,
                    category: req.body.category,
                    brand: req.body.brand,
                    status: req.body.status,
                    countinstock: req.body.countinstock,
                    discountprice: req.body.discountprice,
                    afterdiscount: req.body.afterdiscount
                });

                await newProduct.save();

                res.redirect('/admin/product');
            } catch (sharpError) {
                console.log('Sharp error:', sharpError.message);
                res.status(500).send('Error processing images: ' + sharpError.message);
            }
        });
    } catch (error) {
        console.log('Error adding product:', error);
        res.status(500).send('Error adding product');
        res.render('pagenotfound');
    }
};



let product = async (req, res) => {
    try {
        const perPage = 10; // Number of products per page
        const page = parseInt(req.query.page) || 1; // Current page, default to 1 if not provided

        const totalProducts = await Product.countDocuments({ status: 'active' });
        const totalPages = Math.ceil(totalProducts / perPage);

        const products = await Product.find({ status: 'active' })
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('product', { products, currentPage: page, totalPages });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading product page');
    }
};


let loadAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({ deleted: false });
        res.render('addproduct', { categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading add product page');
    }
};







let editProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        const categories = await Category.find({ deleted: false });
        res.render('editproduct', { product, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};


const uploadForEditProduct = multer({
    storage: storage
}).array('newImages', 5);


const updateProduct = async (req, res) => {
    try {
        uploadForEditProduct(req, res, async function (err) {
            if (err) {
                console.error(err);
                return res.status(400).send('File upload error.');
            }

            const productId = req.params.id;
            const { name, description, price, category, countinstock, discountPrice, afterdiscount, deleteImages } = req.body;

            const updatedProductData = {
                name,
                description,
                price,
                category,
                countinstock,
                discountprice: discountPrice,
                afterdiscount,
            };

            // Fetch the product
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send('Product not found.');
            }

            // Handle image deletion if deleteImages is provided
            if (deleteImages && deleteImages.length > 0) {
                deleteImages.forEach(filename => {
                    const index = product.images.indexOf(filename);
                    if (index !== -1) {
                        product.images.splice(index, 1);
                    }
                });
                await product.save();
            }

            // Process and append new images
            if (req.files && req.files.length > 0) {
                const processedImages = [];
                for (const file of req.files) {
                    const imageBuffer = await sharp(file.path)
                        .resize(1500, 750)
                        .toBuffer();

                    const filename = `cropped_${Date.now()}-${file.originalname}`;
                    const imagePath = path.join(__dirname, '..', 'public', 'productimages', filename);

                    fs.writeFileSync(imagePath, imageBuffer);

                    processedImages.push(filename);
                }

                // Append processed images to existing images
                updatedProductData.images = [...product.images, ...processedImages];
            } else {
                // If no new images were uploaded, keep the existing images
                updatedProductData.images = product.images;
            }

            // Update the product in the database
            const updatedProduct = await Product.findByIdAndUpdate(productId, updatedProductData, { new: true });
            if (!updatedProduct) {
                return res.status(404).send('Product not found.');
            }

            res.redirect('/admin/product');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};





const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
       

        console.log('Deleting product:', productId);

        
        await Product.findByIdAndUpdate(productId, { status: 'deleted' }, { new: true });

        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
       
        res.status(500).json({ error: 'Server Error' });
    }
};

const productdetails = async (req, res) => {
    try {
        const productid = req.params.id;
        let userData;
        let isOAuthUser = false;
 
        if (req.user) {
            userData = req.user;
            isOAuthUser = true;
            console.log(req.user, 'helloworld');
        } else {
            
            const userId = req.session.user_id;

            if (!userId) {
                return res.status(401).send('Unauthorized');
            }

            userData = await User.findById(userId);
        }

        if (!userData) {
            return res.status(404).send('User not found');
        }

        const username = userData.username;

        const singleproduct = await Product.findById(productid);
        if (!singleproduct) {
            return res.status(404).send('Product not found');
        }

        res.render("product-single", { singleproduct, username, isOAuthUser });
    } catch (error) {
        
        res.render('pagenotfound');
    }
};



module.exports = {
    product,
    loadAddProduct,
    addProduct,
    editProduct,
    updateProduct,
    deleteProduct,
    upload,
    productdetails
};
