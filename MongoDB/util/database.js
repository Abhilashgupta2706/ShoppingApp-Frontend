const mongodb = require('mongodb');
require('dotenv').config();

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callBack) => {
    MongoClient
        .connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@nodejsudemy.hccnuys.mongodb.net/shop?retryWrites=true&w=majority`)
        .then(client => {
            console.log('Connected to MongoDB Atlas Cloud Server!');
            _db = client.db();
            callBack();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db
    }
    throw 'No Databse Found!'
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;