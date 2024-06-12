const mongoose = require('mongoose');
const { Schema } = require('mongoose');


const orderSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    cart: {
        type:Schema.Types.ObjectId,
        ref: 'Cart'
    }, 
    
    orderID:{
        type:String,
    },
   
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Pending',
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        title: {
            type: String,
            required: true
        },
        image: [{
            type: String,
            required: true
        }],
        productPrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity can not be less than one.'],
            default: 1
        },
        Status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
            default: 'Confirmed',
        },

        price: {
            type: Number,
        },
    }],
    billTotal: {
        type: Number,
        required: true
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
    },
    paymentMethod: {
        type: String,
        required: true
    }, 
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed', 'Refunded'],
        default: 'Pending',
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    orderNotes: {
        type: String,
        default: ''
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    reasonForReturn: {
        default: 'nil',
        type: String
    },
    couponName:{
    default:'nil',
    type:String
    },
    couponAmount:{
        default:0,
        type:Number
    },
    couponCode:{
        type:String,
        default:'nil'
    }
}, {
    timestamps: true,
});


const Order = mongoose.model('Order', orderSchema)
module.exports = Order;
