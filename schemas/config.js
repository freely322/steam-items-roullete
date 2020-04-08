import {Schema} from 'mongoose';

module.exports = new Schema({
    id: String,
    minBet: Number,
    gameDuration: Number,
    commission: Number,
    nicknameBountyMultiplier: Number
});
