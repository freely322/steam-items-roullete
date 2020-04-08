import mongoose from 'mongoose'
import gameSchema from '../schemas/game';


module.exports = mongoose.model("Game", gameSchema);
