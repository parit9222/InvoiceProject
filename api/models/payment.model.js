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
    },
    paymentype: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: String,
    },
    lastPaidAmount: {
        type: String,
    },
    pendingAmount: {
        type: String,
    },
    invoices: [
        {
            invoiceNumber: {
                type: String,
            },
            paymentInvoice: {
                type: String,
            },
            pendingAmount: {
                type: String,
            },
            purchaseDate: {
                type: String,
            },
            totalAmount: {
                type: String,
            },
        }
    ],

}, { timestamps: true });

const payment = mongoose.model('Payment', paymentSchema);
export default payment;