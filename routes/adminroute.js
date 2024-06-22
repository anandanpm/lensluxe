const express = require('express');
const adminRoute = express();
const adminController = require("../controllers/adminController");
const customerController = require("../controllers/customerController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const OrderController = require ('../controllers/orderController')
const offerController = require('../controllers/offerController')
const couponController = require('../controllers/couponController')
const adminauth = require('../middlewares/adminauth')

// Parse incoming requests with JSON payloads
adminRoute.use(express.json());

// Parse incoming requests with URL-encoded payloads
adminRoute.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine and specify the views directory
adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');




// Routes for admin login and dashboard
adminRoute.get('/',adminauth.isAdminLogout, adminController.adminlogin);
adminRoute.post('/',adminauth.isAdminLogout, adminController.verifyLogin);
adminRoute.get('/dashboard',adminauth.isAdminLogin, adminController.dashboard);
adminRoute.get('/orderdetail/:id',adminauth.isAdminLogin,adminController.orderdetail)
adminRoute.get('/dashboardgraphdata',adminauth.isAdminLogin,adminController.dashboardgraph)
adminRoute.get ('/top-categories',adminauth.isAdminLogin,adminController.categorygraph)
adminRoute.get('/top-products',adminauth.isAdminLogin,adminController.productgraph)
adminRoute.get('/ledgerbook',adminauth.isAdminLogin,adminController.ledgerbook)

// Route for displaying customer details
adminRoute.get('/customer',adminauth.isAdminLogin, customerController.customer);
adminRoute.post('/block/:userId',adminauth.isAdminLogin, customerController.blockUser);
adminRoute.post('/unblock/:userId',adminauth.isAdminLogin, customerController.unblockUser);

// Route for displaying category details
adminRoute.get('/category',adminauth.isAdminLogin, categoryController.categoryGet);
adminRoute.post('/addCategory',adminauth.isAdminLogin, categoryController.addcategoryPost); 
adminRoute.post('/updatecategory/:id',adminauth.isAdminLogin, categoryController.updatecategoryPost); 
adminRoute.post('/deletecategory/:id',adminauth.isAdminLogin, categoryController.deletecategoryPost);

// Route for displaying product details
adminRoute.get('/product',adminauth.isAdminLogin, productController.product);
adminRoute.get('/addproduct',adminauth.isAdminLogin, productController.loadAddProduct);
adminRoute.post('/addproduct',adminauth.isAdminLogin, productController.addProduct);
 adminRoute.get('/editproduct/:id',adminauth.isAdminLogin, productController.editProduct); 
 adminRoute.post('/product/:id',adminauth.isAdminLogin, productController.updateProduct);
 adminRoute.post('/product/delete/:id',adminauth.isAdminLogin, productController.deleteProduct);


adminRoute.get('/order',adminauth.isAdminLogin,OrderController.order)
adminRoute.post('/admin/orders/:formId',adminauth.isAdminLogin, OrderController.updateOrderStatus);
adminRoute.get('/salesreport',adminauth.isAdminLogin, OrderController.salereport);
adminRoute.get('/generate-pdf',adminauth.isAdminLogin,OrderController.pdfsalereport)
adminRoute.post('/add-delivery-charge',adminauth.isAdminLogin,OrderController.DeliveryCharge)

adminRoute.get('/offer',adminauth.isAdminLogin,offerController.offer)
adminRoute.post('/add-discountoffer',adminauth.isAdminLogin,offerController.offercategoryupdate)
adminRoute.get('/categories-with-offers',adminauth.isAdminLogin, offerController.getCategoriesWithOffers);
adminRoute.post('/update-category-offer',adminauth.isAdminLogin,offerController.updateCategoryOffer)
adminRoute.post('/delete-category-offer',adminauth.isAdminLogin,offerController.deleteCategoryOffer)
adminRoute.post('/add-product-offer',adminauth.isAdminLogin,offerController.productdiscountoffer)
adminRoute.delete('/delete-product-offer/:id',adminauth.isAdminLogin,offerController.deleteProductDiscount)
adminRoute.post('/add-referral',adminauth.isAdminLogin,offerController.referraloffer)


adminRoute.get('/coupon',adminauth.isAdminLogin,couponController.coupon)
adminRoute.get('/get-coupons',adminauth.isAdminLogin,couponController.getcoupon)
adminRoute.post('/create-coupon',adminauth.isAdminLogin,couponController.addcoupon)
adminRoute.post('/update-coupon/:id',adminauth.isAdminLogin,couponController.updatecoupon)
adminRoute.delete('/delete-coupon/:id',adminauth.isAdminLogin,couponController.deletecoupon)
adminRoute.get('/get-coupon/:id',adminauth.isAdminLogin,couponController.getcouponsupdate)
adminRoute.get('/adminlogout',adminauth.isAdminLogin,adminController.adminlogout)

module.exports = adminRoute;
