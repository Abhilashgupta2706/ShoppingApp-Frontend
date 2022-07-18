const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    },
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });

    let newQuanitity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuanitity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuanitity;
    } else {
        updatedCartItems.push({ productId: product._id, quantity: newQuanitity })
    };

    const updatedCart = { items: updatedCartItems };
    // console.log('Updated Cart:', updatedCart)

    this.cart = updatedCart;
    return this.save();

};

userSchema.methods.removeFromCart = function (prodId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== prodId.toString()
    });

    this.cart.items = updatedCartItems;

    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save(); 
};

module.exports = mongoose.model('User', userSchema);