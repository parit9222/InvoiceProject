import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
    },
    customerMobileNumber: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
    },
    accountStatus: {
        type: String,
        required: true
    },                      
}, {timestamps: true});

const customer = mongoose.model('Customer', customerSchema);
export default customer;