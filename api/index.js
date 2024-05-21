import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import userInvoice from './routes/user.route.js';
import customerDetails from "./routes/customer.route.js";
import productDetails from "./routes/product.route.js";

dotenv.config();
const app = express();
app.use(express.json());


mongoose.connect(process.env.MONGO).then(() => {
    console.log("Connected with MongoDB!");
}).catch((err) => {
    console.log(err);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000!");
});

app.use('/api/user', userInvoice);
app.use('/api/customer', customerDetails);
app.use('/api/product', productDetails);
