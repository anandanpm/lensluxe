const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./key')
const User = require('../model/userSchema')



// function to generate Referralcode
function generateReferralCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';

    for (let i = 0; i < length; i++) {
        referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return referralCode;
}

//serializeuser

passport.serializeUser((user,done)=>{
    
    done(null,user.id)
})

//deserializeuser
passport.deserializeUser((id,done)=>{
    User.findById(id).then((user)=>{
        done(null,user)
    })
    
})



passport.use(new GoogleStrategy({
    //options for the google strategy
    callbackURL: process.env.CALLBACK_URL,
    clientID: process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET
}, (accessToken, refreshToken, profile, done) => {
    const referralCode = generateReferralCode(8);
    // check if user already exists in  our db
    User.findOne({ email: profile.emails[0].value }).then((currentUser) => {
        if (currentUser) {
            //already have the user
            console.log('user is ',currentUser);
            done(null,currentUser)
        }
        else {
            //if not,create user in our db
            new User({
                username: profile.displayName,
                email: profile.emails[0].value,
                is_admin: 0,
                is_verified: 1,
                ReferralCode: referralCode

            }).save().then((newUser) => {
                console.log('new user created:' + newUser);
                done(null,newUser)
            })
        }

    })

})
)