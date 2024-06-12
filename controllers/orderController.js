const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')
const Coupon = require('../model/couponSchema')
const Wallet = require('../model/walletSchema')
const Deliverycharge = require('../model/deliverySchema')
 const PDFDocument = require('pdfkit');
const pdf = require('html-pdf');
const pdfTemplate = require('../views/users/invoice')
const fs = require('fs');
const path = require('path');
 const Razorpay = require('razorpay')
 
 //generate UNiqueNumber
 function generateUniqueOrderNumber() {
  const prefix = 'ORD';
  const randomNumber = Math.floor(Math.random() * 9000) + 1000; 
  const orderNumber = prefix + randomNumber;
  return orderNumber;
}




const loadOrderpage = async (req, res) => {
  try {
    const couponId = req.body;
    console.log(couponId, 'kingking');
    const cartId = req.params.id;
    let userId, username, isOAuthUser;

    // Check if req.user is present (authenticated via OAuth)
    if (req.user) {
      userId = req.user._id;
      username = req.user.username;
      isOAuthUser = true;
    } else {
      // If req.user is not present, use session.user
      userId = req.session.user_id;
      const userData = await User.findById(userId);
      username = userData.username;
      isOAuthUser = false;
    }

    const userData = await User.findById(userId);
    const addresses = userData.Address || [];
    const cartData = await Cart.findById(cartId).populate('products.productId');
    const cartItemsAddedToOrder = await Order.exists({ cartId: cartId });

    if (cartItemsAddedToOrder) {
      await Cart.findByIdAndDelete(cartId);
    }

    const activeCoupons = await Coupon.find({ isActive: '1' });

   
    const deliveryCharge = await Deliverycharge.findOne();
   

    res.render('checkout', { username, addresses, cart: cartData, coupons: activeCoupons, isOAuthUser,  deliveryCharge: deliveryCharge.amount,deliveryChargeTotal: deliveryCharge.total,});
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
    res.render('pagenotfound');
  }
};

 
const checkstockorder = async (req, res) => {
   
    try {
      const cartId = req.params.cartId;
      console.log(cartId,"lemon")
  
        const cart = await Cart.findById(cartId).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const outOfStockProducts = cart.products.filter(item => item.productId.countinstock === 0);
        if (outOfStockProducts.length > 0) {
            return res.json({error: 'One or more products in the cart are out of stock' });
        }

        return res.json({ success: true, message: 'All products in the cart are in stock' });
    } catch (error) {
        console.error('Error checking stock in cart:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const placeOrder = async (req, res) => {
  try {
    const { cartId, addressId, paymentMethod, totalAmount, selectedCouponId } = req.body;
    console.log(req.body, "goodood with selectedCouponId");
    console.log(cartId, addressId, paymentMethod, totalAmount, "Hellobilll");

    let userId;

    // Check if req.user is present (authenticated via OAuth)
    if (req.user) {
      userId = req.user._id;
    } else {
      // If req.user is not present, use session.user
      userId = req.session.user_id;
    }

    const userData = await User.findById(userId);
    console.log(userData, "gellmino");

    const cartData = await Cart.findById(cartId).populate("products.productId");
    console.log(cartData, "mellinono");

    const address = userData.Address.find((add) => add._id.toString() === addressId);
    if (!address) {
      throw new Error("Invalid address ID.");
    }

    if (cartData.products.length === 0) {
      throw new Error("Your cart is empty. Please add products before placing an order.");
    }

    const outOfStockProducts = cartData.products.filter(product => product.productId.countinstock === 0);
    if (outOfStockProducts.length > 0) {
      throw new Error("Some products in your cart are out of stock.");
    }

    let coupon;
    if (selectedCouponId) {
      coupon = await Coupon.findById(selectedCouponId);
      if (!coupon) {
        throw new Error("Invalid coupon ID.");
      }
    }

    const orderItems = cartData.products.map(product => {
      const productPrice = product.productId.afterdiscount ? product.productId.afterdiscount : product.productId.price;
      return {
        productId: product.productId._id,
        title: product.productId.name,
        image: product.productId.images,
        productPrice,
        quantity: product.quantity,
        price: productPrice * product.quantity,
      };
    });

    const orderData = {
      user: userId,
      cart: cartId,
      orderID:generateUniqueOrderNumber(),
      orderStatus: "Pending",
      items: orderItems,
      billTotal: totalAmount,
      shippingAddress: address,
      paymentMethod,
      paymentStatus: "Pending",
      couponName: coupon ? coupon.name : 'nil',
      couponAmount: coupon ? coupon.maximumAmount : 0,
      couponCode: coupon ? coupon.couponCode : 'nil',
    };

    const newOrder = await Order.create(orderData);

    for (const product of cartData.products) {
      await Product.findByIdAndUpdate(product.productId, { $inc: { countinstock: -product.quantity } });
    }

    await Cart.findByIdAndUpdate(cartId, { $set: { products: [], total: 0 } });

    // Send JSON response with order details
    res.status(200).json({ message: "Order placed successfully.", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(400).json({ error: error.message });
  }
};



const Ordersucess = async (req, res) => {
  try {
    let userData, username;
    let isOAuthUser = false;

    if (req.user) {
      userData = req.user;
      username = userData.username;
      isOAuthUser = true;
    } else {
      userData = await User.findById(req.session.user_id);
      username = userData.username;
    }

    res.render('ordersuccess', { username, isOAuthUser });
  } catch (error) {
    console.log(error);
    res.render('pagenotfound');
  }
};



  
const cancelOrder = async (req, res) => {
  try {
    const { Id, productId } = req.params;
    console.log(req.params, 'mohanlal');
    let userId;

    // Check if req.user is present (authenticated via OAuth)
    if (req.user) {
      userId = req.user._id;
    } else {
      // If req.user is not present, use session.user
      userId = req.session.user_id;
    }

    const getOrder = async (orderId) => {
      return await Order.findById(orderId);
    };

    const getOrderProductIndex = (order, productId) => {
      return order.items.findIndex((item) => item._id.toString() === productId);
    };

    const calculateRefundAmount = (product) => {
      return product.productPrice * product.quantity;
    };

    const getTransactionDescription = (product, order) => {
      return `Refund for Product: ${product.title} (Order ID: ${order._id})`;
    };

    const updateOrderProductStatus = async (order, productIndex) => {
      order.items[productIndex].Status = 'Cancelled';
      console.log(order.items[productIndex].Status, 'orderis done ');
      await order.save();
      let product = await Product.findById(order.items[productIndex].productId);
      product.countinstock += order.items[productIndex].quantity;
      console.log(product.countinstock, 'countinstock');
      console.log(product, 'doneproduct');
      await product.save();
    };

    const updateOrderstatus = async (order, productIndex) => {
      let allItemsCancelled = order.items.every((item) => item.Status === 'Cancelled');
      console.log(allItemsCancelled, 'killme');
      if (allItemsCancelled) {
        order.orderStatus = 'Cancelled';
      }
      if (order.items.length > 1) {
        order.billTotal -= calculateRefundAmount(order.items[productIndex]);
      } else {
        order.billTotal = 0;
      }
      if (order.couponAmount > 0) {
        order.billTotal += order.couponAmount;
        order.couponAmount = 0;
      }
      await order.save();
    };

    const order = await getOrder(Id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const productIndex = getOrderProductIndex(order, productId);
    console.log(productIndex, 'jayasurya');
    if (productIndex === -1) {
      return res.status(404).json({ success: false, error: 'Product not found in the order' });
    }

    const canceledProduct = order.items[productIndex];
    console.log(canceledProduct, 'surya');
    const refundAmount = calculateRefundAmount(canceledProduct);
    console.log(refundAmount, 'vijay');
    const transactionDescription = getTransactionDescription(canceledProduct, order);
    console.log(transactionDescription, 'tovino');

    let userWallet = await Wallet.findOne({ user: userId });
    if (!userWallet) {
      userWallet = new Wallet({
        user: userId,
        walletBalance: 0,
        amountSpent: 0,
        refundAmount: 0,
        transactions: []
      });
    }

    userWallet.walletBalance += refundAmount;
    userWallet.refundAmount += refundAmount;
    const newTransaction = {
      amount: refundAmount,
      description: transactionDescription,
      type: 'credit',
      transactionDate: new Date()
    };
    userWallet.transactions.push(newTransaction);
    await userWallet.save();

    await updateOrderProductStatus(order, productIndex);
    await updateOrderstatus(order, productIndex);

    res.status(200).json({ success: true, message: 'Product cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling product:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};




const order = async (req, res) => {
    try {
        const perPage = 10; 
        const page = parseInt(req.query.page) || 1;
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / perPage);

        
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user')
            .populate('items.productId')
            .skip((page - 1) * perPage)
            .limit(perPage);
            const deliveryChargeData = await Deliverycharge.findOne();
        res.render('order', { orders, currentPage: page, totalPages, deliveryCharge: deliveryChargeData });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
        res.render('pagenotfound');
    }
};





const updateOrderStatus = async (req, res) => {
   

    try {


      const orderId = req.params.formId; // Corrected to orderId
      const { newStatus } = req.body;
  
      console.log(orderId, 'manvirsingh');
      console.log(req.body, 'lemon');

        if (newStatus === 'Cancelled') {
            // Add logic for handling cancelled orders
        } else {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus,paymentStatus:'Success' }, { new: true });

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Failed to update order status' });
    }
};







const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET 
});



const RazorpayCheckout = async (req, res) => {
  try {
    let userId;

    // Check if req.user is present (authenticated via OAuth)
    if (req.user) {
      userId = req.user._id;
    } else {
      // If req.user is not present, use session.user
      userId = req.session.user_id;
    }

    const { totalAmount, cartId, addressId } = req.body;
    console.log('totalamount', req.body);

    const cartData = await Cart.findById(cartId).populate('products.productId');
    const items = cartData.products.map(product => {
      const productPrice = product.productId.afterdiscount ? product.productId.afterdiscount : product.productId.price;
      return {
        productId: product.productId._id,
        title: product.productId.name,
        image: product.productId.images,
        productPrice,
        quantity: product.quantity,
        price: productPrice * product.quantity,
      };
    });

    const userData = await User.findById(userId);
    const address = userData.Address.find(add => add._id.toString() === addressId);

    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: 'order_receipt_' + userId,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    const orderData = {
      user: userId,
      cart: cartId,
      orderID:generateUniqueOrderNumber(),
      orderStatus: 'Pending',
      items: items,
      billTotal: totalAmount,
      shippingAddress: address,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Success',
      orderDate: new Date(),
    };

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    for (const product of cartData.products) {
      await Product.findByIdAndUpdate(product.productId, { $inc: { countinstock: -product.quantity } });
    }

    // Delete the cart after successful order creation and stock updates
    await Cart.findByIdAndDelete(cartId);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Error creating Razorpay order' });
  }
};





const RazorpayFail = async (req, res) => {
  try {
    const { cartId } = req.body;
    console.log(cartId, "jklilll");

    const updatedOrder = await Order.findOneAndUpdate(
      { cart: cartId },
      {
        orderStatus: 'Pending',
        paymentStatus: 'Failed',
        $set: { 'items.$[].Status': 'Pending' },
      },
      { new: true }
    );

    console.log(updatedOrder, "jkiuyl");
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the Status field for each item individually
    for (const item of updatedOrder.items) {
      await Order.updateOne(
        { _id: updatedOrder._id, 'items._id': item._id },
        { $set: { 'items.$.Status': 'Pending' } }
      );
    }

    // Update countInStock for each product
    for (const item of updatedOrder.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { countinstock: item.quantity },
      });
    }

    res.status(200).json({ message: 'Payment failure details received' });
  } catch (error) {
    console.error('Error handling Razorpay failure:', error);
    res.status(500).json({ error: 'Error handling Razorpay failure' });
  }
};

const retryrazorpay = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log(req.body, 'req.body');

    // Find the order by ID
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Calculate the total amount for all products in the order
    const amount = order.items.reduce((sum, product) => {
      return sum + product.productPrice * product.quantity * 100; // Convert to paise (Razorpay expects amount in paise)
    }, 0);

    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

    const receiptValue = `${order._id.toString().slice(-10)}_${order.items[0]._id.toString().slice(-10)}`;
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: receiptValue,
    };

    const response = await razorpay.orders.create(options);

    // Update the paymentStatus to 'Success' and all item statuses to 'Confirmed'
    order.items.forEach((item) => {
      item.Status = 'Confirmed';
    });
    order.paymentStatus = 'Success';

    await order.save();

    return res.status(200).json({
      success: true,
      amount: response.amount,
      razorpayOrderId: response.id,
    });
  } catch (error) {
    console.error('Error in retryrazorpay:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};




const vieworderdetails = async (req, res) => {
  try {
    let userId, username, isOAuthUser = false;
    
    if (req.user) {
      userId = req.user._id.toString(); 
      username = req.user.username;
      isOAuthUser = true;
    } else {
      
      userId = req.session.user_id.toString(); 
      const user = await User.findById(userId);
      username = user.username;
    }

    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('user'); 

    if (!order) {
      res.render('vieworder', { message: "Order not found.", username, isOAuthUser });
      return;
    }

    
    const isUserInOrderSameAsCurrentUser = order.user._id.toString() === userId;
    console.log(isUserInOrderSameAsCurrentUser, 'it is coming the checking please look it');

    if (!isUserInOrderSameAsCurrentUser) {
     
      res.render('vieworder', {
        message: "You are not authorized to view this order.",
        username,
        orders: [] ,
        isOAuthUser
      });
      return;
    }

    
    const { items } = order;
    res.render('vieworder', { orders: [order], items, username, isOAuthUser });
  } catch (error) {
    console.log(error);
    
    res.render('vieworder', { message: "An error occurred. Please try again later.", username, isOAuthUser });
  }
};



const returnOrder = async (req, res) => {
  try {
    const { Id, productId } = req.params;
    console.log(req.params, 'mohanlal');
    let userId;

    // Check if req.user is present (authenticated via OAuth)
    if (req.user) {
      userId = req.user._id;
    } else {
      // If req.user is not present, use session.user
      userId = req.session.user_id;
    }

    const order = await Order.findById(Id).populate('user', 'wallet');
    console.log(order, 'goiejddheitejde');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const productIndex = order.items.findIndex((item) => item._id.toString() === productId);
    console.log(productIndex, 'jayasurya');

    if (productIndex === -1) {
      return res.status(404).json({ success: false, error: 'Product not found in the order' });
    }

    const canceledProduct = order.items[productIndex];
    console.log(canceledProduct, 'surya');
    const refundAmount = canceledProduct.price;
    console.log(refundAmount, 'vijay');
    const transactionDescription = `Refund for product ${canceledProduct.title} in order ${order._id}`;
    console.log(transactionDescription, 'tovino');

    let userWallet = await Wallet.findOne({ user: userId });

    if (!userWallet) {
      userWallet = new Wallet({
        user: userId,
        walletBalance: 0,
        amountSpent: 0,
        refundAmount: 0,
        transactions: [],
      });
    }

    userWallet.walletBalance += refundAmount;
    userWallet.refundAmount += refundAmount;
    const newTransaction = {
      amount: refundAmount,
      description: transactionDescription,
      type: 'credit',
      transactionDate: new Date(),
    };
    userWallet.transactions.push(newTransaction);
    await userWallet.save();

    canceledProduct.Status = 'Returned';
    const allProductsReturned = order.items.every((item) => item.Status === 'Returned');

    if (allProductsReturned) {
      order.orderStatus = 'Returned';
    }

    await order.save();

    res.status(200).json({ success: true, message: 'Product returned successfully', order });
  } catch (error) {
    console.error('Error returning product:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



const downloadpdf = async (req, res) => {
  try {
    const invoiceData = req.body;
  
    
    const html = pdfTemplate(invoiceData);
    

    
    pdf.create(html, {}).toBuffer((err, buffer) => {
      if (err) {
        console.error('Error generating PDF:', err);
        return res.status(500).json({ error: 'Failed to generate PDF' });
      }

      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');

     
      res.send(buffer);
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF' });
  }
}








const salereport = async (req, res) => {
  try {
    let startDate, endDate;
    const { reportType, startDate: customStartDate, endDate: customEndDate } = req.query;
    console.log(req.query, 'salereport');

    if (reportType === 'daily') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'weekly') {
      startDate = new Date();
      endDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate.setDate(endDate.getDate() - endDate.getDay() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'monthly') {
      startDate = new Date();
      endDate = new Date();
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'custom') {
      startDate = customStartDate ? new Date(customStartDate) : null;
      endDate = customEndDate ? new Date(customEndDate) : null;
      if (startDate && endDate) {
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const orders = await Order.find({
      orderStatus: 'Delivered',
      paymentStatus: 'Success',
      orderDate: {
        $gte: startDate || new Date(0),
        $lte: endDate || new Date(),
      },
    })
      .populate('user', 'username email')
      .populate({ path: 'items.productId', select: 'name price' })
      .sort({ orderDate: -1 }) // Sort orders in descending order by orderDate
      .exec();

    res.render('salesreport', { orders });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



const pdfsalereport = async (req, res) => {
  try {
    let startDate, endDate;
    const { reportType, startDate: customStartDate, endDate: customEndDate } = req.query;
    console.log(req.query, 'report');

    if (reportType === 'daily') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'weekly') {
      startDate = new Date();
      endDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate.setDate(endDate.getDate() - endDate.getDay() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'monthly') {
      startDate = new Date();
      endDate = new Date();
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'custom') {
      startDate = customStartDate ? new Date(customStartDate) : null;
      endDate = customEndDate ? new Date(customEndDate) : null;
      if (startDate && endDate) {
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const orders = await Order.find({
      orderStatus: 'Delivered',
      paymentStatus: 'Success',
      orderDate: {
        $gte: startDate || new Date(0),
        $lte: endDate || new Date(),
      },
    })
      .populate('user', 'username email')
      .populate({ path: 'items.productId', select: 'name price' })
      .sort({ orderDate: -1 })
      .exec();

      const doc = new PDFDocument({ size: 'A4', margins: { top: 5, bottom: 5, left: 5, right: 5 } });

res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename=salesreport.pdf');

doc.pipe(res);

doc.fontSize(24).text('Sales Report', { align: 'center' });
doc.moveDown();

if (orders.length === 0) {
  doc.fontSize(18).text('No orders found for the selected criteria.', { align: 'center' });
} else {
  doc.fontSize(16).text('Order Summary', { align: 'center', underline: true });
  doc.moveDown(1);

  // Add table headers
  const tableTop = doc.y;
  const tableHeaders = ['Index', 'Order ID', 'Customer', 'Order Date', 'Items', 'Quantity', 'Total', 'Coupon Name'];
  const tableColumnWidths = [30, 60, 100, 100, 100, 40, 60, 60];

  // Draw table headers
  tableHeaders.forEach((header, i) => {
    doc.fontSize(10).font('Helvetica-Bold').text(header, 50 + tableColumnWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop, { width: tableColumnWidths[i], align: 'left' });
  });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(50 + tableColumnWidths.reduce((a, b) => a + b, 0), doc.y).stroke();
  doc.moveDown(0.5);

  let totalSales = 0;
  let totalDiscount = 0;
  let currentPage = 1;
  let maxRowsPerPage = 20; // Adjust this value as needed

  const renderPage = () => {
    doc.fontSize(10).text(`Page ${currentPage}`, { align: 'center' });
    doc.moveDown(0.5);
  };

  const startNewPage = () => {
    doc.addPage();
    currentPage++;
    renderPage();
    doc.moveTo(50, doc.y).lineTo(50 + tableColumnWidths.reduce((a, b) => a + b, 0), doc.y).stroke();
    doc.moveDown(0.5);
  };

  orders.forEach((order, index) => {
    let orderTotal = 0;
    let itemQuantity = 0;
    const items = order.items.map((item) => {
      const itemTotal = item.quantity * item.productPrice;
      itemQuantity += item.quantity;
      orderTotal += itemTotal;
      return `${item.title}`;
    }).join(', ');

    totalSales += orderTotal;
    totalDiscount += order.couponAmount || 0;

    const rowY = doc.y;
    if (index > 0 && index % maxRowsPerPage === 0) {
      startNewPage();
    }

    doc.fontSize(8);
    doc.text(`${index + 1}`, 50, rowY, { width: tableColumnWidths[0] });
    doc.text(order.orderID, 50 + tableColumnWidths[0], rowY, { width: tableColumnWidths[1] });
    doc.text(`${order.user.username}`, 50 + tableColumnWidths[0] + tableColumnWidths[1], rowY, { width: tableColumnWidths[2] });
    doc.text(order.orderDate.toLocaleString(), 50 + tableColumnWidths[0] + tableColumnWidths[1] + tableColumnWidths[2], rowY, { width: tableColumnWidths[3] });
    doc.text(items, 50 + tableColumnWidths[0] + tableColumnWidths[1] + tableColumnWidths[2] + tableColumnWidths[3], rowY, { width: tableColumnWidths[4] });
    doc.text(`${itemQuantity}`, 50 + tableColumnWidths.slice(0, 5).reduce((a, b) => a + b, 0), rowY, { width: tableColumnWidths[5] });
    doc.text(`₹${orderTotal.toFixed(2)}`, 50 + tableColumnWidths.slice(0, 6).reduce((a, b) => a + b, 0), rowY, { width: tableColumnWidths[6] });
    doc.text(order.couponName || 'nil', 50 + tableColumnWidths.slice(0, 7).reduce((a, b) => a + b, 0), rowY, { width: tableColumnWidths[7] });
    doc.moveDown(1);
  });
  doc.moveDown(5);
  // Add total sales and total discount
  // doc.fontSize(12).font('Helvetica-Bold').text(`Total Sales: ₹${totalSales.toFixed(2)}`, { align: 'center' });
  // doc.moveDown(0.5);
  // doc.fontSize(12).font('Helvetica-Bold').text(`Total Discount: ₹${totalDiscount.toFixed(2)}`, { align: 'center' });
}

doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const DeliveryCharge = async (req, res) => {
  try {
      const { charge, billTotal } = req.body;

      
      if (isNaN(charge) || charge < 0 || isNaN(billTotal) || billTotal < 0) {
          return res.status(400).json({ message: 'Invalid input' });
      }

     
      await Deliverycharge.deleteMany({});

      
      const newCharge = new Deliverycharge({ amount: charge, total:billTotal });
      await newCharge.save();

      res.status(200).json({ message: 'Delivery charge added successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};






 

module.exports = {
    loadOrderpage,
    placeOrder,
    Ordersucess,
    cancelOrder,
    order,
    updateOrderStatus,
    checkstockorder,
    RazorpayCheckout,
    RazorpayFail,
    vieworderdetails,
    returnOrder,
    downloadpdf,
    salereport,
    pdfsalereport,
    retryrazorpay,
    DeliveryCharge
    
};