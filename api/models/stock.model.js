import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
    },
    productsName: {
        type: String,
        required: true,
    },
    qty: {
        type: String,
        required: true
    },
    newStockDate: {
        type: String,
        required: true,
    },
    rate: {
        type: String,
        required: true
    },
    stockAmount: {
        type: String,
        required: true
    },

}, { timestamps: true });

const stock = mongoose.model('Stock', stockSchema);
export default stock;