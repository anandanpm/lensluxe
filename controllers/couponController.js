const Coupon = require('../model/couponSchema')


const coupon = async (req,res)=>{
    try {
        res.render('coupon')
    } catch (error) {
        console.log(error)
    }
}

 const getcoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
};

const addcoupon =  async (req, res) => {
    
    try {
        const { name, startDate, endDate, minimumAmount, maximumAmount, discount, couponCode } = req.body;
console.log(req.body,'coupon')


const existingCouponName = await Coupon.findOne({ name: name });
if (existingCouponName) {
    return res.status(400).json({ message: 'A coupon with this name already exists' });
}


const existingCouponCode = await Coupon.findOne({ couponCode: couponCode });
if (existingCouponCode) {
    return res.status(400).json({ message: 'A coupon with this code already exists' });
}

        const newCoupon = new Coupon({
            name,
            startDate,
            endDate,
            minimumAmount,
            maximumAmount,
            couponCode
        });

        await newCoupon.save();
        res.status(201).json({ message: 'Coupon created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon' });
    }
};

const updatecoupon= async (req, res) => {
   
    try {
        const { name, startDate, endDate, minimumAmount, maximumAmount, discount, couponCode } = req.body;

        const currentCoupon = await Coupon.findById(req.params.id);
        if (!currentCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        
        const existingCoupon = await Coupon.findOne({ name: name });
        if (existingCoupon && existingCoupon._id.toString() !== req.params.id) {
            return res.status(400).json({ 
                message: 'A coupon with this name already exists',
                currentName: currentCoupon.name,
                conflictingName: name
            });
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, {
            name,
            startDate,
            endDate,
            minimumAmount,
            maximumAmount,
            couponCode
        });

        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json({ message: 'Coupon updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon' });
    }
};


const deletecoupon =  async (req, res) => {
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!deletedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon' });
    }
};


 const getcouponsupdate = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json(coupon); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupon details' });
    }
};

const applycoupon = async (req, res) => {
  
    try {
        const { couponId, totalAmount } = req.body;
        console.log(couponId, totalAmount, 'kill');
    
        const coupon = await Coupon.findById(couponId);

        if (!coupon || coupon.status !== 'Active') {
            return res.json({ success: false, message: 'Coupon not found or inactive' });
        }

        const currentDate = new Date();
        if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
            return res.json({ success: false, message: 'Coupon has expired' });
        }

        const isCouponApplied = coupon.users.includes(req.session.user_id);
        if (isCouponApplied) {
            return res.json({ success: false, message: 'Coupon is already applied' });
        }

        if (totalAmount < coupon.minimumAmount) {
            return res.json({ success: false, message: `Minimum purchase amount required: ${coupon.minimumAmount}` });
        }

        const discountAmount =  coupon.maximumAmount;

        coupon.users.push(req.session.user_id);
        await coupon.save();

        res.json({ success: true, discountAmount, message: 'Coupon applied successfully' });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


module.exports = {
    coupon,
    getcoupon,
    addcoupon,
    updatecoupon,
    deletecoupon,
    getcouponsupdate,
    applycoupon
}