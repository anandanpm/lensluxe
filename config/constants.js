// Order Status Enum
const ORDER_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    RETURNED: 'Returned'
};

// Payment Status Enum
const PAYMENT_STATUS = {
    PENDING: 'Pending',
    SUCCESS: 'Success',
    FAILED: 'Failed',
    REFUNDED: 'Refunded'
};

// User Verification Status
const USER_STATUS = {
    VERIFIED: 1,
    UNVERIFIED: 0
};

// Admin Status
const ADMIN_STATUS = {
    ADMIN: 1,
    USER: 0
};

// Category Status
const CATEGORY_STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive'
};

// Product Status
const PRODUCT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

// Success Messages
const SUCCESS_MESSAGES = {
    // Category
    CATEGORY_ADDED: 'Category added successfully',
    CATEGORY_UPDATED: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',
    CATEGORY_REACTIVATED: 'Category reactivated successfully',
    
    // Product
    PRODUCT_ADDED: 'Product added successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    
    // Order
    ORDER_PLACED: 'Order placed successfully',
    ORDER_CANCELLED: 'Order cancelled successfully',
    ORDER_RETURNED: 'Order returned successfully',
    ORDER_STATUS_UPDATED: 'Order status updated successfully',
    PRODUCT_CANCELLED: 'Product cancelled successfully',
    PRODUCT_RETURNED: 'Product returned successfully',
    
    // User
    USER_BLOCKED: 'User blocked successfully',
    USER_UNBLOCKED: 'User unblocked successfully',
    
    // Offer
    CATEGORY_OFFER_UPDATED: 'Category offer updated successfully',
    CATEGORY_OFFER_DELETED: 'Category offer deleted successfully',
    PRODUCT_DISCOUNT_UPDATED: 'Product discount updated successfully',
    PRODUCT_DISCOUNT_DELETED: 'Product discount deleted successfully',
    
    // Coupon
    COUPON_ADDED: 'Coupon added successfully',
    COUPON_UPDATED: 'Coupon updated successfully',
    COUPON_DELETED: 'Coupon deleted successfully',
    
    // Payment
    PAYMENT_SUCCESS: 'Payment completed successfully',
    REFUND_PROCESSED: 'Refund processed successfully',
    
    // Wallet
    AMOUNT_CREDITED: 'Amount credited to wallet',
    AMOUNT_DEBITED: 'Amount debited from wallet'
};

// Error Messages
const ERROR_MESSAGES = {
    // General
    INTERNAL_SERVER_ERROR: 'Internal server error',
    SOMETHING_WENT_WRONG: 'Something went wrong',
    UNAUTHORIZED: 'Unauthorized access',
    
    // Category
    CATEGORY_NOT_FOUND: 'Category not found',
    CATEGORY_ALREADY_EXISTS: 'Category already exists',
    CATEGORY_NAME_REQUIRED: 'Category name is required',
    CATEGORY_NAME_EMPTY: 'Category name cannot be empty or just spaces',
    
    // Product
    PRODUCT_NOT_FOUND: 'Product not found',
    PRODUCT_OUT_OF_STOCK: 'Product is out of stock',
    PRODUCTS_OUT_OF_STOCK: 'One or more products in the cart are out of stock',
    
    // Order
    ORDER_NOT_FOUND: 'Order not found',
    INVALID_ADDRESS: 'Invalid address selected',
    NO_SAVED_ADDRESSES: 'No saved addresses found. Please add a shipping address to your profile.',
    EMPTY_CART: 'Your cart is empty. Please add products before placing an order',
    
    // User
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Email or password is incorrect',
    NOT_ADMIN: 'You are not authorized as admin',
    USER_BLOCKED: 'Your account has been blocked',
    
    // Offer
    INVALID_DISCOUNT: 'Invalid discount value',
    CATEGORY_OFFER_HIGHER: 'Category offer has a higher discount',
    
    // Coupon
    COUPON_NOT_FOUND: 'Coupon not found',
    INVALID_COUPON: 'Invalid coupon code',
    COUPON_EXPIRED: 'Coupon has expired',
    
    // Payment
    PAYMENT_FAILED: 'Payment failed',
    RAZORPAY_ERROR: 'Error creating Razorpay order',
    
    // Wallet
    WALLET_NOT_FOUND: 'Wallet not found',
    INSUFFICIENT_WALLET_BALANCE: 'Insufficient wallet balance',
    
    // Validation
    REQUIRED_FIELDS_MISSING: 'Required fields are missing',
    INVALID_INPUT: 'Invalid input provided'
};

// Validation Messages
const VALIDATION_MESSAGES = {
    CATEGORY_NAME_MIN_LENGTH: 'Category name must be at least 3 characters',
    CATEGORY_NAME_MAX_LENGTH: 'Category name must not exceed 50 characters',
    CATEGORY_NAME_PATTERN: 'Category name should contain only letters and spaces',
    PRODUCT_NAME_REQUIRED: 'Product name is required',
    PRICE_POSITIVE: 'Price must be a positive number',
    STOCK_NON_NEGATIVE: 'Stock cannot be negative',
    DISCOUNT_RANGE: 'Discount must be between 0 and 100',
    EMAIL_INVALID: 'Invalid email format',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters'
};

module.exports = {
    ORDER_STATUS,
    PAYMENT_STATUS,
    USER_STATUS,
    ADMIN_STATUS,
    CATEGORY_STATUS,
    PRODUCT_STATUS,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    VALIDATION_MESSAGES
};
