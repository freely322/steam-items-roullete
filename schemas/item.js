import {Schema} from 'mongoose';

module.exports = new Schema({
    classid: String,
    instanceid: String,
    sell_price: Number,
    name: String,
    hash_name: String,
    sell_listings: Number
});
