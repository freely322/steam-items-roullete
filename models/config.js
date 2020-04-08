import mongoose from 'mongoose'
import betSchema from '../schemas/config';


module.exports = mongoose.model("Config", betSchema);
