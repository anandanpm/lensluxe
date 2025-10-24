const User = require('../model/userSchema');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, USER_STATUS } = require('../config/constants');



const customer = async (req, res) => {
    try {
        const perPage = 10; 
        const page = parseInt(req.query.page) || 1; 

        const totalCustomers = await User.countDocuments({ is_admin: 0 });
        const totalPages = Math.ceil(totalCustomers / perPage);

        const users = await User.find({ is_admin: 0 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('customer', { users, currentPage: page, totalPages });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading customer details');
       
    }
};


// const blockUser = async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         console.log(userId)
//         await User.findByIdAndUpdate(userId, { is_verified: 0 });
//        if(req.session.user_id===userId){
//         console.log(req.session.user_id)
//         req.session.user = false
        

//        }
//         res.redirect('/admin/customer'); 
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Error blocking user');
//         res.render('pagenotfound')
//     }
// }


// const unblockUser = async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         await User.findByIdAndUpdate(userId, { is_verified: 1 });
//         res.redirect('/admin/customer'); 
//     } catch (error) {
//         console.log(error.message);

const blockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        await User.findByIdAndUpdate(userId, { is_verified: USER_STATUS.UNVERIFIED });

        // If the blocked user is currently logged in
        if (req.session.user_id === userId) {
            req.session.destroy(err => {
                if (err) console.log('Error destroying session:', err);
            });
        }

        res.redirect('/admin/customer');
    } catch (error) {
        console.log("blockUser error:", error.message);
        if (!res.headersSent) {
            res.status(500).render('pagenotfound');
        }
    }
};

const unblockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        await User.findByIdAndUpdate(userId, { is_verified: USER_STATUS.VERIFIED });
        res.redirect('/admin/customer');
    } catch (error) {
        console.log("unblockUser error:", error.message);
        if (!res.headersSent) {
            res.status(500).render('pagenotfound');
        }
    }
};

module.exports = {
    customer,
    blockUser,
    unblockUser
}