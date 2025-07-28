// const isLogin = async(req,res,next) => {
//     try{
//         if(req.session.user_id && req.session.user){
//             next();
//         }else{
//             res.redirect('/login')
//         }
//     } catch(error){
//         console.log(error.message)
//     }   
//   }
  
//   const isLogout = async(req,res,next) => {
//     try{
//         if(req.session.user_id && req.session.user){
//             res.redirect('/loginedhome');
//         }else{
//             next();
//         }
  
//     }catch(error){
//         console.log(error.message)
//     }
//   }
//   module.exports ={
//     isLogin,
//     isLogout
//   }

const User = require('../model/userSchema');

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id && req.session.user) {
            const user = await User.findById(req.session.user_id);
            if (user && user.is_verified === 1) {
                return next();
            } else {
                // Blocked or invalid user
                req.session.destroy(() => {
                    res.redirect('/login');
                });
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log("isLogin middleware error:", error.message);
        res.status(500).render('pagenotfound');
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id && req.session.user) {
            return res.redirect('/loginedhome');
        } else {
            next();
        }
    } catch (error) {
        console.log("isLogout middleware error:", error.message);
        res.status(500).render('pagenotfound');
    }
};

module.exports={
    isLogin,
    isLogout
}