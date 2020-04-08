import {Schema} from 'mongoose';
import itemSchema from './item'

module.exports = new Schema({
    id: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    game: { type: Schema.Types.ObjectId, ref: 'Game' },
    items: {type: [{
        classid: String,
        instanceid: String,
        id: String,
        price: Number,
        name: String,
        hash_name: String,
        color: String,
        quality: String,
        icon: String
    }], default: []}
});
