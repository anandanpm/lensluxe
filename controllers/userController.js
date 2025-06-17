const nodemailer = require('nodemailer');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');
const Product = require('../model/productSchema')
const Category = require('../model/categorySchema');
const Order = require('../model/orderSchema')
const Wishlist = require('../model/wishlistSchema')
const Wallet = require('../model/walletSchema')
const ReferralCode = require('../model/referalSchema')

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       
    pass: process.env.EMAIL_PASSWORD    
  },
  tls: {
    rejectUnauthorized: false           
  }
});


const Loadhome = async (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading home page');

    }
};

const loadlogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading login page');
        res.render('pagenotfound')
    }
};

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.render('login', { message: "Email or passsword is incorrect " });
                } else {
                    req.session.user_id = userData._id;
                    req.session.user = true
                    res.redirect('loginedhome');
                }
            } else {
                res.render('login', { message: "Email or password is incorrect" });
            }
        } else {
            res.render('login', { message: "Email or password is incorrect" });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error verifying login');
        res.render('pagenotfound')
    }
};

const loginedhome = async (req, res) => {
    try {
        let userData;
        let isOAuthUser = false;

        if (req.user) {
            userData = req.user;
            isOAuthUser = true;
            console.log(req.user, 'helloworld');
        } else {
            const userId = req.session.user_id;
            userData = await User.findById(userId);
        }

        if (userData) {
            const username = userData.username;
            res.render('loginedhome', { username, isOAuthUser });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading logged-in home page');
    }
};



const loadsign = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading signup page');
        res.render('pagenotfound')
    }
};

const loadotp = async (req, res) => {
    try {
        // Check if the session already contains OTP data
        if (!req.session.data || !req.session.data.otp) {
            // Generate OTP
            const otp = generateOTP();
            console.log('Generated OTP:', otp);

            let otpexpiration = Date.now() + 60000;
            let { username, email, password, confirm_password,ReferralCode } = req.body;
            let data = { username, email, password, confirm_password, otp, otpexpiration,ReferralCode };
            req.session.data = data;
            req.session.save();
            console.log(req.session.data);

            // Send OTP via email
            await sendOtpEmail(req.session.data.email, otp);
        }

        res.render('otp');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading OTP page');
        res.render('pagenotfound')
    }
};






const otpverify = async (req, res) => {
    try {
        if (req.session.data.otp == req.body.otp) {
            console.log("OTP is correct");
            const referralCode = generateReferralCode(8);
            console.log(referralCode, "Generated referralCode");

            if (req.session.data.otpexpiration < Date.now()) {
                res.render("otp", { message: 'Your OTP has expired. Resending OTP.' });
                const newOtp = generateOTP();
                console.log('Generated new OTP:', newOtp);
                req.session.data.otp = newOtp;
                req.session.data.otpexpiration = Date.now() + 60000;
                await sendOtpEmail(req.session.data.email, newOtp);
                return res.render('otp', { message: 'OTP has been resent. Please check your email.' });
            }

            const spassword = await securePassword(req.session.data.password);
            const user = new User({
                username: req.session.data.username,
                email: req.session.data.email,
                password: spassword,
                is_admin: 0,
                is_verified: 1,
                ReferralCode: referralCode
            });
            await user.save();
            console.log("User saved:", user);

            const wishlist = new Wishlist({
                user: user._id,
                items: []
            });
            await wishlist.save();
            console.log("Wishlist created:", wishlist);

            if (req.session.data.ReferralCode) {
                console.log(req.session.data.ReferralCode, 'Referral code provided');

                let userWallet = await Wallet.findOne({ user: user._id });

                if (!userWallet) {
                    userWallet = new Wallet({ user: user._id });
                    await userWallet.save();
                }

                try {
                    console.log(req.session.data.ReferralCode, 'referralCode to be searched');
                    console.log(userWallet, 'userWallet is coming');

                    const referralCodeValue = req.session.data.ReferralCode;
                    const referrerUser = await User.findOne({ ReferralCode: referralCodeValue });
                    console.log(referrerUser, 'referrerUser result');

                    if (referrerUser) {
                        const referralCodeData = await ReferralCode.findOne();
                        const referredAmount = referralCodeData.referredamount;
                        const newUserAmount = referralCodeData.newuseramount;

                        let referrerWallet = await Wallet.findOne({ user: referrerUser._id });
                        if (!referrerWallet) {
                            referrerWallet = new Wallet({ user: referrerUser._id });
                            await referrerWallet.save();
                        }
                        referrerWallet.walletBalance += referredAmount;
                        referrerWallet.transactions.push({
                            amount: referredAmount,
                            description:  `Referral bonus for referring ${user.username}`,
                            type: 'Credit',
                        });
                        await referrerWallet.save();

                        userWallet.walletBalance += newUserAmount;
                        userWallet.transactions.push({
                            amount: newUserAmount,
                            description: `Referral bonus for being referred by ${referrerUser.username}`,
                            type: 'Credit',
                        });
                        await userWallet.save();

                        console.log('Referral bonus added to wallets');
                    } else {
                        console.log('Invalid referral code');
                    }
                } catch (error) {
                    console.error('Error handling referral bonus:', error);
                }
            }

            return res.render('login');
        } else {
            console.log("Incorrect OTP. Rendering 'otp' page.");
            return res.render('otp', { message: 'Incorrect OTP. Please try again.' });
        }
    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).render('otp', { message: 'Error verifying OTP' });
        res.render('pagenotfound');
    }
};
  
const resendOTP = async (req, res) => {
    try {
        // Generate new OTP
        const newOtp = generateOTP();
        console.log('Generated new OTP:', newOtp);
        
        // Update session data with the new OTP and reset the timer
        req.session.data.otp = newOtp;
        req.session.data.otpexpiration = Date.now() + 60000; // 60 seconds

        // Resend the new OTP via email
        await sendOtpEmail(req.session.data.email, newOtp);

        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error resending OTP' });
        res.render('pagenotfound')
    }
};

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

//function to generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Function to send OTP via email
function sendOtpEmail(recipientEmail, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Your OTP',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Error sending email:', error);

        } else {
            console.log('Email sent:', info.response);
        }
    });
}
// function to generate Referralcode
function generateReferralCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
  
    for (let i = 0; i < length; i++) {
      referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return referralCode;
  }




// const loadshop = async (req, res) => {
//     try {
//         let userData;
//         let isOAuthUser = false;

//         // Check if req.user is present (user is authenticated via Passport)
//         if (req.user) {
//             userData = req.user;
//             isOAuthUser = true;
//             console.log(req.user, 'helloworld');
//         } else {
//             // Fallback to session if req.user is not present
//             const userId = req.session.user_id;
//             userData = await User.findById(userId);
//         }

//         // If user data is found, proceed with loading the shop
//         if (userData) {
//             const username = userData.username;

//             const perPage = 10; // Number of products per page
//             const page = parseInt(req.query.page) || 1; // Current page number, default is 1 if not provided

//             const sort = req.query.sort;
//             let sortOrder;

//             switch (sort) {
//                 case 'az':
//                     sortOrder = { name: 1 }; // Sort by name ascending
//                     break;
//                 case 'za':
//                     sortOrder = { name: -1 }; // Sort by name descending
//                     break;
//                 case 'priceLowHigh':
//                     sortOrder = { price: 1 }; // Sort by price ascending
//                     break;
//                 case 'priceHighLow':
//                     sortOrder = { price: -1 }; // Sort by price descending
//                     break;
//                 default:
//                     sortOrder = {}; // No sorting
//             }

//             const Categorys = await Category.find({ status: 'Active', deleted: false });
//             const activeCategoryIds = Categorys.map(category => category._id);

//             // Count total products
//             const totalProducts = await Product.countDocuments({ category: { $in: activeCategoryIds }, status: 'active' });
//             const totalPages = Math.ceil(totalProducts / perPage);

//             // Fetch products for the current page
//             const products = await Product.find({ category: { $in: activeCategoryIds }, status: 'active' })
//                 .sort(sortOrder) // Apply sorting
//                 .skip((page - 1) * perPage)
//                 .limit(perPage);

//             res.render('shop', { username, products, Categorys, currentPage: page, totalPages, isOAuthUser });

//         } 
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Error loading shop page');
//         res.render('pagenotfound'); // Assuming this is your error page rendering
//     }
// };


const loadshop = async (req, res) => {
    try {
        let userData;
        let isOAuthUser = false;

        // Check if req.user is present (user is authenticated via Passport)
        if (req.user) {
            userData = req.user;
            isOAuthUser = true;
            console.log(req.user, 'helloworld');
        } else {
            // Fallback to session if req.user is not present
            const userId = req.session.user_id;
            userData = await User.findById(userId);
        }

        // If user data is found, proceed with loading the shop
        if (userData) {
            const username = userData.username;

            const perPage = 10; // Number of products per page
            const page = parseInt(req.query.page) || 1; // Current page number, default is 1 if not provided

            const sort = req.query.sort;
            let sortOrder = {};

            switch (sort) {
                case 'az':
                    sortOrder = { name: 1 }; // Sort by name ascending
                    break;
                case 'za':
                    sortOrder = { name: -1 }; // Sort by name descending
                    break;
                case 'priceLowHigh':
                    sortOrder = { price: 1 }; // Sort by price ascending
                    break;
                case 'priceHighLow':
                    sortOrder = { price: -1 }; // Sort by price descending
                    break;
            }

            const Categorys = await Category.find({ status: 'Active', deleted: false });
            
            let query = { status: 'active' };

            // Handle category filter
            if (req.query.categoryId) {
                query.category = req.query.categoryId;
            } else {
                const activeCategoryIds = Categorys.map(category => category._id);
                query.category = { $in: activeCategoryIds };
            }

            // Handle search
            if (req.query.search) {
                query.name = { $regex: req.query.search, $options: 'i' };
            }

            // Handle price range filter
            if (req.query.minPrice && req.query.maxPrice) {
                query.price = { $gte: parseFloat(req.query.minPrice), $lte: parseFloat(req.query.maxPrice) };
            } else if (req.query.minPrice) {
                query.price = { $gte: parseFloat(req.query.minPrice) };
            } else if (req.query.maxPrice) {
                query.price = { $lte: parseFloat(req.query.maxPrice) };
            }

            // Count total products
            const totalProducts = await Product.countDocuments(query);
            const totalPages = Math.ceil(totalProducts / perPage);

            // Fetch products for the current page
            const products = await Product.find(query)
                .sort(sortOrder)
                .skip((page - 1) * perPage)
                .limit(perPage);

            res.render('shop', { 
                username, 
                products, 
                Categorys, 
                currentPage: page, 
                totalPages, 
                isOAuthUser,
                query: req.query // Pass query parameters to the view
            });
        } else {
            res.redirect('/login'); // Redirect to login if user data is not found
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading shop page');
        res.render('pagenotfound'); // Assuming this is your error page rendering
    }
};



const logout = async (req, res) => {
    try {
        req.session.user_id = null;
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading logged-in home page');
        res.render('pagenotfound')
    }
}






const Loadprofile = async (req, res) => {
    try {
        let userData;
        let isOAuthUser = false;

        // Check if req.user is present (user is authenticated via Passport)
        if (req.user) {
            userData = req.user;
            isOAuthUser = true;
            console.log(req.user, 'helloworld');
        } else {
            // Fallback to session if req.user is not present
            const userId = req.session.user_id;
            userData = await User.findById(userId);
        }

        if (userData) {
            const userOrders = await Order.find({ user: userData._id })
                .sort({ orderDate: -1 })
                .populate('items.productId');
            const walletData = await Wallet.findOne({ user: userData._id });

            // Sort wallet transactions in descending order (newest first)
            if (walletData && walletData.transactions) {
                walletData.transactions.sort((a, b) => {
                    return new Date(b.transactionDate) - new Date(a.transactionDate);
                });
            }

            res.render('profile', {
                userData: userData,
                username: userData.username,
                orders: userOrders,
                email: userData.email,
                walletData: walletData,
                isOAuthUser: isOAuthUser
            });
        } else {
            // If no user data is found, redirect to login or show an appropriate message
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading profile page');
        res.render('pagenotfound');
    }
};





const AddAddress = async (req, res) => {
    try {
      console.log(req.body);
      let userId
  
      // Check if req.user is present (authenticated via OAuth)
      if (req.user) {
        userId = req.user._id;
        
      } else {
        // If req.user is not present, use session.user
        userId = req.session.user_id;
      }
  
      console.log(userId);
      const userData = await User.findById(userId);
  
      if (userData) {
        const { houseName, street, city, state, country, postalCode, phoneNumber, type } = req.body;
        userData.Address.push({ houseName, street, city, state, country, postalCode, phoneNumber, type });
        await userData.save();
        res.status(200).json({ message: 'Address added successfully' });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Error adding address' });
      res.render('pagenotfound');
    }
  };


const editAddress = async (req, res) => {
    try {
      const addressId = req.params.id;
      console.log(addressId);
      let userId;
  
      // Check if req.user is present (authenticated via OAuth)
      if (req.user) {
        userId = req.user._id;
      } else {
        // If req.user is not present, use session.user
        userId = req.session.user_id;
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const addressIndex = user.Address.findIndex(addr => addr._id.toString() === addressId);
      if (addressIndex === -1) {
        return res.status(404).json({ error: 'Address not found or user does not own this address' });
      }
  
      user.Address[addressIndex].houseName = req.body.houseName;
      user.Address[addressIndex].street = req.body.street;
      user.Address[addressIndex].city = req.body.city;
      user.Address[addressIndex].state = req.body.state;
      user.Address[addressIndex].postalCode = req.body.postalCode;
      user.Address[addressIndex].country = req.body.country;
      user.Address[addressIndex].phoneNumber = req.body.phoneNumber;
      user.Address[addressIndex].addressType = req.body.addressType;
  
      await user.save();
      res.status(200).json({ message: 'Address updated successfully', updatedAddress: user.Address[addressIndex] });
    } catch (error) {
      console.error('Error updating address:', error.message);
      res.status(500).json({ error: 'Internal server error' });
      res.render('pagenotfound');
    }
  };




const deleteAddress = async (req, res) => {
    try {
      const addressId = req.params.id;
      let userId;
  
      // Check if req.user is present (authenticated via OAuth)
      if (req.user) {
        userId = req.user._id;
      } else {
        // If req.user is not present, use session.user
        userId = req.session.user_id;
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.Address.pull(addressId);
      await user.save();
      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Error deleting address' });
      res.render('pagenotfound');
    }
  };


const editUsernameEmail = async (req, res) => {
    try {
      const { username, email } = req.body;
      let userId;
  
      // Check if req.user is present (authenticated via OAuth)
      if (req.user) {
        userId = req.user._id;
      } else {
        // If req.user is not present, use session.user
        userId = req.session.user_id;
      }
  
      const user = await User.findByIdAndUpdate(
        userId,
        { username: username, email: email },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'Username and Email updated successfully', user });
    } catch (error) {
      console.error('Error updating username and email:', error.message);
      res.status(500).json({ error: 'Internal server error' });
      res.render('pagenotfound');
    }
  };




const changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      console.log(req.body);
      let userId;
  
      // Check if req.user is present (authenticated via OAuth)
      if (req.user) {
        userId = req.user._id;
      } else {
        // If req.user is not present, use session.user
        userId = req.session.user_id;
      }
  
      console.log(userId);
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
      console.log(isPasswordMatch, 'it is comming home');
  
      if (!isPasswordMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Error changing password' });
    }
  };
  
  
  




const loadforgotpassword = async (req, res) => {
    try {
        res.render('forgottenpassword')
    } catch (error) {
        console.error('Error loading forgot password:', error);

    }
};



const verifyforgotpassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email, 'jailer');

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }


        const newOtp = generateOTP();
        console.log(newOtp)
        const newOtpExpiration = Date.now() + 60000;
        const details = { newOtp: newOtp, newOtpExpiration: newOtpExpiration, email: email }

        req.session.details = details;
        req.session.save();
        sendOtpEmail(email, newOtp);

        return res.status(200).json({ message: 'Email sent successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const loadforgototp = async (req, res) => {
    try {
        res.render('forgottenotp')
    } catch (error) {
        console.log(error)
    }
}

const verifyforgototp = async (req, res) => {
    try {
        const otp = req.body.otp;

        console.log(otp, "gillmill kill")
        const sessionOtp = req.session.details.newOtp;
        console.log(sessionOtp, "sessionOtp")

        const sessionOtpExpiration = req.session.details.newOtpExpiration;
        console.log(sessionOtpExpiration, "sessionotpexpiration")

        if (!sessionOtp || !sessionOtpExpiration || Date.now() > sessionOtpExpiration) {
            return res.status(400).json({ message: 'OTP expired or invalid' });
        }

        if (parseInt(otp) !== sessionOtp) {
            return res.status(400).json({ message: 'Incorrect OTP' });
        }


        delete req.session.newotp;
        delete req.session.newotpexpiration;

        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const resetpassword = async (req, res) => {
    try {
        res.render('resetpassword')
    } catch (error) {
        console.log(error)
    }
}

const resettingpassword = async (req, res) => {
    try {
        const newPassword = req.body.password.toString();
        console.log(newPassword, "jill")

        const email = req.session.details.email;
        let password = await securePassword(newPassword)
        console.log(password, "lilllomn")
        const updatedUser = await User.findOneAndUpdate({ email }, { password: password });

        if (!updatedUser) {
            return res.status(400).json({ message: 'User not found or password not updated' });
        }
        console.log("checking");
        // res.status(200).json({ message: 'Password updated successfully' });
        res.redirect('/login')
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};





module.exports = {
    Loadhome,
    loadlogin,
    verifyLogin,
    loginedhome,
    loadsign,
    loadotp,
    otpverify,
    resendOTP,
    loadshop,
    logout,
    Loadprofile,
    AddAddress,
    editAddress,
    deleteAddress,
    editUsernameEmail,
    changePassword,
    loadforgotpassword,
    loadforgototp,
    verifyforgotpassword,
    verifyforgototp,
    resetpassword,
    resettingpassword

}