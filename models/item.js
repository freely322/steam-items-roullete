import mongoose from 'mongoose'
import itemSchema from '../schemas/item';


module.exports = mongoose.model("Item", itemSchema);
