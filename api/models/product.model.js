import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productsName: {
        type: String,
        required: true,
    },
    qty: {
        type: String,
        required: true
    },
    rate: {
        type: String,
        required: true
    },
}, { timestamps: true });

const product = mongoose.model('Product', productSchema);
export default product;