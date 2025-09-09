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
router.get(
  "/google/redirect",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res, next) => {
    try {
      if (!req.user) {
        console.log("No user found in req.user after Google login");
        return res.redirect("/login");
      }

      console.log("Authenticated user:", req.user);

      // Make sure you're checking the right field & type
      if (req.user.is_verified === 1 || req.user.is_verified === true) {
        return res.redirect("/loginedhome");
      } else {
        console.log("User is not verified:", req.user);
        return res.redirect("/login");
      }
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
