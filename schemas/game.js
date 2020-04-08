import {Schema} from 'mongoose';

module.exports = new Schema({
    id: Number,
    passed: {type: Boolean, default: false},
    duration: {type: Number, default: 5},
    time: Number,
    bets: [{ type: Schema.Types.ObjectId, ref: 'Bet' }],
    winner: { type: Schema.Types.ObjectId, ref: 'Bet' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    chance: Number,
    weight: Number,
    total: Number,
    prize: {type: [{
            id: String,
            price: Number,
            name: String,
            hash_name: String,
            color: String,
            quality: String,
            icon: String
        }], default: []},
});
