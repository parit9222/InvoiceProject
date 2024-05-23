import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true,
    },
    customerMobileNumber: {
        type: String,
        required: true
    },
    purchaseDate: {
        type: String,
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            productname: {
                type: String,
                required: true
            },
            qty: {
                type: String,
                required: true
            },
            rate: {
                type: String,
                required: true
            },
            amount: {
                type: String,
                // required: true
            },
            discountper: {
                type: String,
                // required: true
            },
            discountamount: {
                type: String,
                // required: true
            },
        }
    ],
    totalDiscount: {
        type: String,
        required: true
    },
    totalAmount: {
        type: String,
        required: true
    },
}, { timestamps: true });

const invoice = mongoose.model('Invoice', invoiceSchema);
export default invoice;