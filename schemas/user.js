import {Schema} from 'mongoose';


module.exports = new Schema({
    id: String,
    tradeLink: String,
    avatar: String,
    nickname: String,
    bets: [{ type: Schema.Types.ObjectId, ref: 'Bet' }],
    wins: {type: Number, default: 0},
    games: {type: Number, default: 0},
    totalWin: {type: Number, default: 0},
    inventory: [{
        classid: String,
        instanceid: String,
        price: Number,
        name: String,
        id: String,
        hash_name: String,
        quality: String,
        color: String,
        icon: String
    }],
});
