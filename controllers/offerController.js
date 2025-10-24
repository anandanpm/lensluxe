const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')
const Category = require('../model/categorySchema');
const ReferralCode = require('../model/referalSchema');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, VALIDATION_MESSAGES } = require('../config/constants');

const offer = async (req, res) => {
    try {
        const categories = await Category.find({ deleted: false });
        const products = await Product.find({ status: 'active' }); 
        const referralcode = await ReferralCode.find()
        res.render('offer', { categories, products,referralcode });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

const offercategoryupdate = async (req, res) => {
    try {
        const { category, discount } = req.body;
        
        // Validate discount value
        if (!discount || discount < 0 || discount > 100) {
            return res.status(400).json({ error: VALIDATION_MESSAGES.DISCOUNT_RANGE });
        }

        const updatedCategory = await Category.findByIdAndUpdate(category, { offer: discount }, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: ERROR_MESSAGES.CATEGORY_NOT_FOUND });
        }

        const products = await Product.find({ category: category });
        for (const product of products) {
            const discountedPrice = product.price * (1 - discount / 100);
            product.afterdiscount = +discountedPrice.toFixed(2);
            await product.save();
        }

        res.json({ message: SUCCESS_MESSAGES.CATEGORY_OFFER_UPDATED, updatedCategory });
    } catch (error) {
        console.error('Error updating category offer:', error);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

const getCategoriesWithOffers = async (req, res) => {
    try {
        const categories = await Category.find({ deleted: false, offer: { $gt: 0 } }).select('name offer');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories with offers:', error);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

const updateCategoryOffer = async (req, res) => {
    try {
        const { category, discount } = req.body;

        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(404).json({ error: ERROR_MESSAGES.CATEGORY_NOT_FOUND });
        }

        // Validate discount value
        if (!discount || discount < 0 || discount > 100) {
            return res.status(400).json({ error: VALIDATION_MESSAGES.DISCOUNT_RANGE });
        }

        existingCategory.offer = discount;
        const updatedCategory = await existingCategory.save();

        const products = await Product.find({ category: category });
        for (const product of products) {
            const discountedPrice = (product.price * (100 - discount)) / 100;
            product.afterdiscount = +discountedPrice.toFixed(2); 
            await product.save();
        }

        res.json({ message: SUCCESS_MESSAGES.CATEGORY_OFFER_UPDATED, updatedCategory });
    } catch (error) {
        console.error('Error updating category offer:', error);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

const deleteCategoryOffer = async (req, res) => {
    try {
      const { category } = req.body;
      const deletedCategory = await Category.findByIdAndUpdate(category, { offer: 0 }, { new: true });
  
      if (!deletedCategory) {
        return res.status(404).json({ error: ERROR_MESSAGES.CATEGORY_NOT_FOUND });
      }
  
      const products = await Product.find({ category: category });
  
      for (const product of products) {
        if (product.discount > 0) {
         
          product.afterdiscount = product.price - (product.price * (product.discount / 100));
        } else {
         
          product.afterdiscount = 0
        }
        await product.save();
      }
  
      res.json({ message: SUCCESS_MESSAGES.CATEGORY_OFFER_DELETED });
    } catch (error) {
      console.error('Error deleting category offer:', error);
      res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  };

const productdiscountoffer = async (req, res) => {
    try {
      const { productId, discount } = req.body;

      if (!productId || !discount) {
          return res.status(400).json({ error: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING });
      }
        
      // Validate discount value
      if (discount < 0 || discount > 100) {
          return res.status(400).json({ error: VALIDATION_MESSAGES.DISCOUNT_RANGE });
      }
      
      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).json({ error: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
      }

      const categoryOffer = await Category.findOne({ _id: product.category });
        
      if (categoryOffer && categoryOffer.offer > discount) {
          return res.json({ message: ERROR_MESSAGES.CATEGORY_OFFER_HIGHER });
      } else {
          product.discount = discount;
          product.afterdiscount = product.price - (product.price * discount / 100);
          await product.save();
          res.json({ message: SUCCESS_MESSAGES.PRODUCT_DISCOUNT_UPDATED });
      }
    } catch (error) {
        console.error('Error updating product discount:', error);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

const deleteProductDiscount = async (req, res) => {
   
  
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ error: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
      }
  
      const category = await Category.findById(product.category);
      const categoryOffer = category && category.offer ? category.offer : 0;
  
      product.discount = 0;
      product.afterdiscount = 0;
  
      if (categoryOffer) {
        const categoryOfferAmount = product.price * (categoryOffer / 100);
        product.afterdiscount = product.price - categoryOfferAmount;
      }
  
      await product.save();
  
      if (categoryOffer) {
        res.json({
          message: `Product discount deleted successfully. Category offer of ${categoryOffer}% (${product.price * (categoryOffer / 100)}) applied. After discount price: ${product.afterdiscount}`
        });
      } else {
        res.json({ message: SUCCESS_MESSAGES.PRODUCT_DISCOUNT_DELETED });
      }
    } catch (error) {
      console.error('Error deleting product discount:', error);
      res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  };

  const referraloffer = async (req, res) => {
  
    try {
      const { referredamount, newuseramount } = req.body;
      
      // Validate referral amounts
      if (!referredamount || !newuseramount) {
          return res.status(400).json({ error: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING });
      }
      
      if (referredamount < 0 || newuseramount < 0) {
          return res.status(400).json({ error: 'Referral amounts must be positive numbers' });
      }
      
      const newReferralCode = new ReferralCode({ referredamount, newuseramount });
      console.log(newReferralCode, 'is it okkk');
  
      // Delete existing referral codes
      await ReferralCode.deleteMany({});
      
      // Save new referral code
      await newReferralCode.save();
      
      res.redirect('/admin/offer');
    } catch (err) {
        console.error('Error saving referral code:', err);
        res.status(500).send(ERROR_MESSAGES.INTERNAL_SERVER_ERROR + ': ' + err.message);
    }
};

module.exports = {
    offer,
    offercategoryupdate,
    getCategoriesWithOffers,
    updateCategoryOffer,
    deleteCategoryOffer,
    productdiscountoffer,
    deleteProductDiscount ,
    referraloffer
  

}