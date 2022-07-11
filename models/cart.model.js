const fs = require('fs');
const path = require('path');

const rootDir = path.dirname(require.main.filename);
const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {

    static addProduct(prodId, productPrice) {
        fs.readFile(p, (err, data) => {
            let cart = { products: [], totalPrice: 0 }
            if (!err) {
                cart = JSON.parse(data)
            }

            const existingProductIndex = cart.products.findIndex(prod => prod.id === prodId)
            const existingProduct = cart.products[existingProductIndex]

            let updatedProduct
            if (existingProduct) {
                updatedProduct = { ...existingProduct }
                updatedProduct.qty = updatedProduct.qty + 1
                cart.products = [...cart.products]
                cart.products[existingProductIndex] = updatedProduct
            } else {
                updatedProduct = { id: prodId, qty: 1 }
                cart.products = [...cart.products, updatedProduct]
            }

            // cart.totalPrice = cart.totalPrice + parseInt(productPrice)
            cart.totalPrice = cart.totalPrice + +productPrice
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                if (err == null) { return }
                console.log(err)
            })
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, data) => {
            if (err) {
                return
            }
            const updatedCart = { ...JSON.parse(data) };
            const product = updatedCart.products.find(prod => prod.id === id)
            if (!product) { return }
            const productQty = product.qty
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id)
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty

            fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
                if (err == null) { return }
                console.log(err)
            })
        })
    }

    static getCart(callBAckFunc) {
        fs.readFile(p, (err, data) => {
            const cart = JSON.parse(data)
            if (err) {
                callBAckFunc(null)
            } else {
                callBAckFunc(cart)
            }
        })
    }
}