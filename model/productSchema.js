const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    },
    countinstock: {
        type: Number,
        required: true
    },
    discountprice: {
        type: Number,
       
    },
    afterdiscount: {
        type: Number,
       
    },
    productadddate: {
        type: Date,
        required: true,
        default: Date.now() 
    }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
