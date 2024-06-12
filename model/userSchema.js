
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        
    },
    password: {
        type: String,
      
    },
    is_admin: {
        type: Number,
       
    },
    is_verified: {
        type: Number,
       
    },
    ReferralCode:{
        type:String

    },
    Address: [{
        houseName: {
            type: String,
            required: true
        },
        street: {
            type: String,
            requried: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        postalCode: {
            type: Number,
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        type: {
            type: String,
        }
    }]


})

const User = mongoose.model("User", userSchema)

module.exports = User;