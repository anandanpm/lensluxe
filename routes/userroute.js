const express = require('express');
const userRoute = express();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController")
const categoryController = require("../controllers/categoryController")
const CartController = require('../controllers/cartController')
const OrderController = require ('../controllers/orderController')
const wishlistController = require('../controllers/wishlistController')
const couponController = require('../controllers/couponController')
const walletController = require('../controllers/walletController')
const auth  = require('../middlewares/auth');


userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/users');




// Existing routes
userRoute.get('/',auth.isLogout, userController.Loadhome);
userRoute.get('/login',auth.isLogout, userController.loadlogin);
userRoute.post('/login',auth.isLogout, userController.verifyLogin);
userRoute.get('/loginedhome',auth.isLogin, userController.loginedhome);
userRoute.get('/signup',auth.isLogout, userController.loadsign);
userRoute.post('/signup',auth.isLogout, userController.loadotp);
userRoute.post('/otp',auth.isLogout, userController.otpverify); 
userRoute.get('/shop',userController.loadshop) 
userRoute.get('/product-single/:id',auth.isLogin,productController.productdetails)
userRoute.get('/logout',auth.isLogin,userController.logout)
userRoute.get('/profile',auth.isLogin,userController.Loadprofile)
userRoute.post('/profile/addAddress',auth.isLogin,userController.AddAddress)
userRoute.post('/profile/editAddress/:id',auth.isLogin,userController.editAddress)
userRoute.delete('/profile/deleteAddress/:id',auth.isLogin,userController.deleteAddress)
userRoute.post('/profile/updateUsernameEmail',auth.isLogin,userController.editUsernameEmail)
userRoute.post('/profile/changePassword',auth.isLogin,userController.changePassword)

userRoute.get('/forgottenpassword',auth.isLogout,userController.loadforgotpassword)
userRoute.post('/check-email',auth.isLogout,userController. verifyforgotpassword)
userRoute.get('/forgottenotp',auth.isLogout,userController.loadforgototp)
userRoute.post('/verifyforgototp',auth.isLogout,userController.verifyforgototp)
userRoute.get('/resetpassword',auth.isLogout,userController.resetpassword)
userRoute.post('/changepassword',userController.resettingpassword)




userRoute.get('/cart', auth.isLogin, CartController.cart);
userRoute.get('/product/check-stock/:id', auth.isLogin, CartController.checkStock);
 userRoute.post('/cart/add/:id', auth.isLogin, CartController. addtoCart);
 userRoute.post('/cart/update-quantity/:productId/:newQuantity', auth.isLogin, CartController.updateQuantity);
 userRoute.get('/api/getCartTotal',auth.isLogin,CartController.getCartTotal)
userRoute.delete('/cart/delete/:productId',auth.isLogin,CartController.deleteCartItem);

userRoute.get('/checkout/:id',auth.isLogin,OrderController.loadOrderpage)
userRoute.post('/check-stock/:cartId',auth.isLogin,OrderController.checkstockorder)
userRoute.post('/place-order',auth.isLogin,OrderController.placeOrder);
userRoute.get('/ordersuccess',auth.isLogin,OrderController.Ordersucess)
userRoute.post('/cancel-product/:Id/:productId',auth.isLogin,OrderController.cancelOrder)
userRoute.post('/return-product/:Id/:productId',auth.isLogin,OrderController.returnOrder)
userRoute.post('/razorpay-order',auth.isLogin,OrderController.RazorpayCheckout)
userRoute.post('/razorpay/failure',auth.isLogin,OrderController.RazorpayFail)
userRoute.get('/vieworder/:id',auth.isLogin,OrderController.vieworderdetails)
userRoute.post('/retry-payment',auth.isLogin,OrderController.retryrazorpay)


userRoute.get('/wishlist',auth.isLogin,wishlistController.wishlist)
userRoute.post('/wishlist/add/:id',auth.isLogin,wishlistController.addToWishlist)
userRoute.post('/add-to-cart-wishlist/:id',auth.isLogin,wishlistController.addToCartWishlist)
 userRoute.delete('/remove-from-wishlist/:id',auth.isLogin,wishlistController.removeFromWishlist)

userRoute.post('/apply-coupon',auth.isLogin,couponController.applycoupon)

userRoute.post('/applied-coupon',auth.isLogin,OrderController.loadOrderpage)
userRoute.post('/generate-invoice',auth.isLogin,OrderController.downloadpdf)

userRoute.get('/check-wallet-balance',auth.isLogin,walletController.walletCheck)
userRoute.post('/deduct-wallet-balance',auth.isLogin,walletController.reducewallet)





module.exports = userRoute;