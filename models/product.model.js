const db = require('../util/database');

module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    };

    save() {
        return db.execute(
            'INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)',
            [this.title, this.price, this.description, this.imageUrl]
        );
    };

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    };

    static deletebyId(id) {
    };


    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    };
};