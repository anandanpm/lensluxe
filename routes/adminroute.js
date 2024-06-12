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
adminRoute.get('/dashboard',adminauth.isAdminLogout, adminController.dashboard);
adminRoute.get('/orderdetail/:id',adminauth.isAdminLogout,adminController.orderdetail)
adminRoute.get('/dashboardgraphdata',adminauth.isAdminLogout,adminController.dashboardgraph)
adminRoute.get ('/top-categories',adminauth.isAdminLogout,adminController.categorygraph)
adminRoute.get('/top-products',adminauth.isAdminLogout,adminController.productgraph)
adminRoute.get('/ledgerbook',adminauth.isAdminLogout,adminController.ledgerbook)

// Route for displaying customer details
adminRoute.get('/customer',adminauth.isAdminLogout, customerController.customer);
adminRoute.post('/block/:userId',adminauth.isAdminLogout, customerController.blockUser);
adminRoute.post('/unblock/:userId',adminauth.isAdminLogout, customerController.unblockUser);

// Route for displaying category details
adminRoute.get('/category',adminauth.isAdminLogout, categoryController.categoryGet);
adminRoute.post('/addCategory',adminauth.isAdminLogout, categoryController.addcategoryPost); 
adminRoute.post('/updatecategory/:id',adminauth.isAdminLogout, categoryController.updatecategoryPost); 
adminRoute.post('/deletecategory/:id',adminauth.isAdminLogout, categoryController.deletecategoryPost);

// Route for displaying product details
adminRoute.get('/product',adminauth.isAdminLogout, productController.product);
adminRoute.get('/addproduct',adminauth.isAdminLogout, productController.loadAddProduct);
adminRoute.post('/addproduct',adminauth.isAdminLogout, productController.addProduct);
 adminRoute.get('/editproduct/:id',adminauth.isAdminLogout, productController.editProduct); 
 adminRoute.post('/product/:id',adminauth.isAdminLogout, productController.updateProduct);
 adminRoute.post('/product/delete/:id',adminauth.isAdminLogout, productController.deleteProduct);


adminRoute.get('/order',adminauth.isAdminLogout,OrderController.order)
adminRoute.post('/admin/orders/:formId',adminauth.isAdminLogout, OrderController.updateOrderStatus);
adminRoute.get('/salesreport',adminauth.isAdminLogout, OrderController.salereport);
adminRoute.get('/generate-pdf',adminauth.isAdminLogout,OrderController.pdfsalereport)
adminRoute.post('/add-delivery-charge',adminauth.isAdminLogout,OrderController.DeliveryCharge)

adminRoute.get('/offer',adminauth.isAdminLogout,offerController.offer)
adminRoute.post('/add-discountoffer',adminauth.isAdminLogout,offerController.offercategoryupdate)
adminRoute.get('/categories-with-offers',adminauth.isAdminLogout, offerController.getCategoriesWithOffers);
adminRoute.post('/update-category-offer',adminauth.isAdminLogout,offerController.updateCategoryOffer)
adminRoute.post('/delete-category-offer',adminauth.isAdminLogout,offerController.deleteCategoryOffer)
adminRoute.post('/add-product-offer',adminauth.isAdminLogout,offerController.productdiscountoffer)
adminRoute.delete('/delete-product-offer/:id',adminauth.isAdminLogout,offerController.deleteProductDiscount)
adminRoute.post('/add-referral',adminauth.isAdminLogout,offerController.referraloffer)


adminRoute.get('/coupon',adminauth.isAdminLogout,couponController.coupon)
adminRoute.get('/get-coupons',adminauth.isAdminLogout,couponController.getcoupon)
adminRoute.post('/create-coupon',adminauth.isAdminLogout,couponController.addcoupon)
adminRoute.post('/update-coupon/:id',adminauth.isAdminLogout,couponController.updatecoupon)
adminRoute.delete('/delete-coupon/:id',adminauth.isAdminLogout,couponController.deletecoupon)
adminRoute.get('/get-coupon/:id',adminauth.isAdminLogout,couponController.getcouponsupdate)


module.exports = adminRoute;
