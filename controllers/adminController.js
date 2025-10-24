const User = require('../model/userSchema');
const Order = require('../model/orderSchema');
const Product = require('../model/productSchema');
const Category = require('../model/categorySchema')
const bcrypt = require('bcrypt');
const { ORDER_STATUS, PAYMENT_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../config/constants');

const adminlogin = async (req, res) => {
    try {
        res.render('adminlogin');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading admin login page');
        
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
 
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('adminlogin', { message: ERROR_MESSAGES.NOT_ADMIN });
                } else {
                    req.session.admin_id = userData._id;
                    console.log(req.session.admin_id ,' adminid it is comming')
                    req.session.admin_id == true
                    res.redirect('/admin/dashboard');
                }
            } else {
                res.render('adminlogin', { message: ERROR_MESSAGES.INVALID_CREDENTIALS });
            }
        } else {
            res.render('adminlogin', { message: ERROR_MESSAGES.NOT_ADMIN });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error verifying admin login');
        
    }
}


const dashboard = async (req, res) => {
    try {
        const products = await Product.find({status:'active'})
        const deliveredOrders = await Order.find({ orderStatus: 'Delivered'});

       
        const totalRevenue = deliveredOrders.reduce((total, order) => total + order.billTotal, 0);

        const orderCount = deliveredOrders.length;
        const productCount = products.length;

        let week = new Date()
        week.setDate(week.getDate()-7)

        let oders = await Order.find({
          orderStatus:'Delivered',
          createdAt: { $gte: week }
        });
        
        let lastweekcount = oders.length
        console.log(lastweekcount,'is it comming if it correct ')
        
        res.render('dashboard', { totalRevenue, orderCount,productCount,lastweekcount });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading dashboard');
    }
}



 


const dashboardgraph = async (req, res) => {
  try {
    const timePeriod = req.query.timePeriod;
    console.log(timePeriod, 'timePeriod is coming ok');
    
    let startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    let endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    console.log(startDate, 'is coming startDate');
    console.log(endDate, 'is coming endDate');
    
    if (startDate && isNaN(startDate.getTime())) {
      throw new Error('Invalid start date format');
    }
    if (endDate && isNaN(endDate.getTime())) {
      throw new Error('Invalid end date format');
    }

    const getOrdersData = async () => {
      const currentDate = new Date();
      let startDateFilter = new Date();
      let endDateFilter = currentDate;
      let dateFormat = '%Y'; // Default format for yearly

      switch (timePeriod) {
        case 'weekly':
          startDateFilter.setDate(currentDate.getDate() - 6); // Including today
          dateFormat = '%Y-%m-%d';
          break;
        case 'monthly':
          startDateFilter.setMonth(currentDate.getMonth() - 11); // Last 12 months
          dateFormat = '%Y-%m';
          break;
        case 'yearly':
          startDateFilter.setFullYear(currentDate.getFullYear() - 4); // Last 5 years
          break;
        case 'custom':
          if (startDate && endDate) {
            startDateFilter = new Date(startDate.setHours(0, 0, 0, 0));
            endDateFilter = new Date(endDate.setHours(23, 59, 59, 999));
            dateFormat = '%Y-%m-%d'; // Custom date format
          } else {
            throw new Error('Start date and end date are required for custom date range');
          }
          break;
        default:
          throw new Error('Invalid time period');
      }

      const orders = await Order.aggregate([
        {
          $match: {
            orderStatus: 'Delivered',
            orderDate: { $gte: startDateFilter, $lte: endDateFilter }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: '$orderDate'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return orders.map(order => ({ label: order._id, count: order.count }));
    };

    const ordersData = await getOrdersData();
    console.log(ordersData, 'data is coming in the home');
    res.json(ordersData);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};




const categorygraph = async (req, res) => {
  try {
    const topCategories = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } }, // Filter only delivered orders
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $addFields: {
          'productDetails.category': { $toObjectId: '$productDetails.category' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails._id',
          categoryName: { $first: '$categoryDetails.name' },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          category: '$categoryName',
          count: 1,
          _id: 0
        }
      }
    ]);

    console.log(topCategories, 'topcategories is coming');
    res.json(topCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







const  productgraph = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } }, // Filter only delivered orders
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails._id',
          productName: { $first: '$productDetails.name' },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          product: '$productName',
          count: 1,
          _id: 0
        }
      }
    ]);

    console.log(topProducts, 'topProducts is coming');
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const orderdetail = async (req, res) => {
    try {
      const id = req.params.id;
      const order = await Order.findById(id);
      const orders = [order];
      console.log(orders, 'kill');
      res.render('orderdetail', { orders });
    } catch (error) {
      console.log(error);
    }
  };


  
  
const ledgerbook = async(req,res)=>{
  try {
    const orders = await Order.find().populate('user', 'username').populate('items.productId', 'name').exec(); 
    res.render('ledgerbook', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

const adminlogout = async(req,res)=>{
try {
  req.session.admin_id = null;
res.redirect('/admin/')
} catch (error) {
  console.log(error)
}


}


module.exports = {
    adminlogin,
    verifyLogin,
    dashboard,
    orderdetail ,
    dashboardgraph,
    categorygraph,
    productgraph,
    ledgerbook,
    adminlogout
   
}
