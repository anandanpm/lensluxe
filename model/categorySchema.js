const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    deleted: {
        type: Boolean,
        default: false
    },
    offer: {
        type: Number,
        default: 0
    },
    offerStart: {
        type: Date,
        default: null
    },
    offerEnd: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
