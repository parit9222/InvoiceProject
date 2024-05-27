import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    receiptNumber: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerMobileNumber: {
        type: String,
        required: true,
    },
    receiptDate: {
        type: String,
        required: true,
    },
    paidAmount: {
        type: String,
        required: true,
    },
    invoiceNumber: {
        type: String,
        // required: true,
    },
    paymentype: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: String,
        // required: true,
    },
    lastPaidAmount: {
        type: String,
        // required: true,
    },
    pendingAmount: {
        type: String,
        // required: true,
    },

}, { timestamps: true });

const payment = mongoose.model('Payment', paymentSchema);
export default payment;