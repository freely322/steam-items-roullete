import mongoose from 'mongoose'
import betSchema from '../schemas/bet';


module.exports = mongoose.model("Bet", betSchema);
