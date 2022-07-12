const mongodb = require('mongodb')
const getDb = require('../util/database').getDb;
const objectId = mongodb.ObjectId;

class User {
    constructor(username, email) {
        this.username = username;
        this.email = email;
    };

    save() {
        const db = getDb();

        return db
            .collection('users')
            .insertOne(this)
            .then(user => {
                console.log(user);
                return user
            })
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
                console.log("In User findById", user);
                return user
            })
            .catch(err => { console.log(err) });
    };
}

module.exports = User