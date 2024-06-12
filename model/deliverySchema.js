const mongoose = require('mongoose');
const Deliveryschema = mongoose.Schema({
    amount:{
        type:Number,
        default:0
    },
    total:{
        type:Number,
        default:0
    }
})
module.exports = mongoose.model('Deliveryschema',  Deliveryschema);