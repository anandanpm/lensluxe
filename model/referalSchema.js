const mongoose = require('mongoose');

const ReferralSchema = mongoose.Schema({
    referredamount:{
        type:Number,
        default:0
    },
    newuseramount:{
        type:Number,
        default:0
    }
})

const ReferralCode = mongoose.model("Referralcode", ReferralSchema)

module.exports = ReferralCode;