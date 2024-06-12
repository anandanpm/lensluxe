const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')
const Category = require('../model/categorySchema');
const ReferralCode = require('../model/referalSchema');



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

       
        const updatedCategory = await Category.findByIdAndUpdate(category, { offer: discount }, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        
        const products = await Product.find({ category: category });
        for (const product of products) {
            const discountedPrice = product.price * (1 - discount / 100);
            
            product.afterdiscount = +discountedPrice.toFixed(2);
            await product.save();
        }

        res.json({ message: 'Category offer updated successfully', updatedCategory });
    } catch (error) {
        console.error('Error updating category offer:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};


const getCategoriesWithOffers = async (req, res) => {
    try {
        const categories = await Category.find({ deleted: false, offer: { $gt: 0 } }).select('name offer');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories with offers:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};



const updateCategoryOffer = async (req, res) => {
    try {
        const { category, discount } = req.body;

        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        
        existingCategory.offer = discount;
        const updatedCategory = await existingCategory.save();

        
        const products = await Product.find({ category: category });
        for (const product of products) {
            
            const discountedPrice = (product.price * (100 - discount)) / 100;
            product.afterdiscount = +discountedPrice.toFixed(2); 
            await product.save();
        }

     
        res.json({ message: 'Category offer updated successfully', updatedCategory });
    } catch (error) {
        console.error('Error updating category offer:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};




const deleteCategoryOffer = async (req, res) => {
    try {
      const { category } = req.body;
      const deletedCategory = await Category.findByIdAndUpdate(category, { offer: 0 }, { new: true });
  
      if (!deletedCategory) {
        return res.status(404).json({ error: 'Category not found' });
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
  
      res.json({ message: 'Category offer deleted successfully' });
    } catch (error) {
      console.error('Error deleting category offer:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  };






const productdiscountoffer = async (req, res) => {
   

    try {

      const { productId, discount } = req.body;

      if (!productId || !discount) {
          return res.status(400).json({ error: 'Product ID and discount are required' });
      }
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const categoryOffer = await Category.findOne({ _id: product.category });
        
        if (categoryOffer && categoryOffer.offer > discount) {
           
            res.json({ message: 'Category offer has a higher discount' });
        } else {
            product.discount = discount;
            product.afterdiscount = product.price - (product.price * discount / 100);
            await product.save();
            res.json({ message: 'Product discount updated successfully' });
        }
    } catch (error) {
        console.error('Error updating product discount:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

const deleteProductDiscount = async (req, res) => {
   
  
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
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
        res.json({ message: 'Product discount deleted successfully.' });
      }
    } catch (error) {
      console.error('Error deleting product discount:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  };

  const referraloffer = async (req, res) => {
  
    try {
      const { referredamount, newuseramount } = req.body;
      console.log(req.body);
  
      const newReferralCode = new ReferralCode({ referredamount, newuseramount });
      console.log(newReferralCode, 'is it okkk');
  
        
        await ReferralCode.deleteMany({});
        
      
        await newReferralCode.save();
        
        res.redirect('/admin/offer');
    } catch (err) {
        res.status(500).send('Error saving referral code: ' + err.message);
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