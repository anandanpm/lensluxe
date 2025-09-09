const router = require('express').Router();
const passport = require('passport')
// authlogin
router.get('/login',(req,res)=>{
    res.render('login');
})

//auth logout
router.get('/logout',(req,res)=>{
    //handle with passport
    req.logout(()=>{
        res.redirect('/')
    })
    
})




// auth with google 
router.get('/google',passport.authenticate("google",{
    scope:['profile','email']
}))

//callback route for google to redirect to
// router.get('/google/redirect',passport.authenticate('google'),(req,res)=>{
   
//     // res.send(req.user)
//     res.redirect('/loginedhome')
// })
router.get('/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res, next) => {
    try {
      if (req.user.is_verified === 1) {
        req.session.user_id = req.user._id;   // ✅ store in session
        req.session.user = req.user;          // ✅ store in session
        return res.redirect('/loginedhome');
      } else {
        console.log('User is not verified');
        return res.redirect('/login');
      }
    } catch (err) {
      next(err);
    }
  }
);


module.exports = router;
