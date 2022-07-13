const mongodb = require('mongodb')
const getDb = require('../util/database').getDb;
const objectId = mongodb.ObjectId;

class User {
    constructor(username, email, cart, id) {
        this.username = username;
        this.email = email;
        this.cart = cart; // {item: [] }
        this._id = id;
    };

    save() {
        const db = getDb();

        return db
            .collection('users')
            .insertOne(this)
            .then(user => {
                // console.log(user);
                return user
            })
            .catch(err => { console.log(err) });

    };

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });

        let newQuanitity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuanitity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuanitity;
        } else {
            updatedCartItems.push({ productId: new objectId(product._id), quantity: newQuanitity })
        };


        const updatedCart = { items: updatedCartItems };

        // console.log('Updated Cart:', updatedCart)

        const db = getDb();

        return db
            .collection('users')
            .updateOne(
                { _id: new objectId(this._id) },
                { $set: { cart: updatedCart } }
            );

    };

    getCart() {
        const db = getDb();

        const productIds = this.cart.items.map(i => {
            return i.productId
        });

        return db
            .collection('products')
            .find({ _id: { $in: productIds } }).toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p, quantity: this.cart.items.find(i => {
                            return i.productId.toString() === p._id.toString();
                        }).quantity
                    }
                });
            })
            .catch(err => { console.log(err) });
    };

    deleteItemFromCart(prodId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== prodId.toString()
        });

        const db = getDb();

        return db
            .collection('users')
            .updateOne(
                { _id: new objectId(this._id) },
                { $set: { cart: { items: updatedCartItems } } }
            );

    };

    addOrder() {
        const db = getDb();

        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new objectId(this._id),
                        name: this.username
                    }
                };
                return db
                    .collection('orders')
                    .insertOne(order);
            })
            .then(result => {
                this.cart = { items: [] }
                return db
                    .collection('users')
                    .updateOne(
                        { _id: new objectId(this._id) },
                        { $set: { cart: { items: [] } } }
                    );
            })
            .catch(err => { console.log(err) });;


    };

    getOrders() {
        const db = getDb();


        return db
            .collection('orders')
            .find({ 'user._id': new objectId(this._id) }).toArray()
            .catch(err => { console.log(err) });
    };

    static findById(userId) {
        const db = getDb();

        return db
            .collection('users')
            .findOne({
                _id: new objectId(userId)
            })
            .then(user => {
                // console.log("In User findById", user);
                return user
            })
            .catch(err => { console.log(err) });
    };
}

module.exports = User