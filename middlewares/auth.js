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


const isLogin = async (req, res, next) => {
    try {
        if (req.user || (req.session.user_id && req.session.user)) {
            next();
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.user || (req.session.user_id && req.session.user)) {
            res.redirect('/loginedhome');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    isLogin,
    isLogout
}
