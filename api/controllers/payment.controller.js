import Payment from "../models/payment.model.js";

export const payment = async (req, res, next) => {
    try {

        const {
            receiptNumber,
            customerName,
            customerMobileNumber,
            receiptDate,
            paidAmount,
            invoiceNumber,
            paymentype,
            totalAmount,
            lastPaidAmount,
            pendingAmount, 
            invoices: itemData,           
        } = req.body;

        const itemObjects = itemData.map(item => ({
            invoiceNumber: item.invoiceNumber,
            paymentInvoice: item.paymentInvoice,
            pendingAmount: item.pendingAmount,
            purchaseDate: item.purchaseDate,
            totalAmount: item.totalAmount,
        }));

        const newPayment = new Payment({
            receiptNumber,
            customerName,
            customerMobileNumber,
            receiptDate,
            paidAmount,
            invoiceNumber,
            paymentype,
            totalAmount,
            lastPaidAmount,
            pendingAmount,
            invoices: itemObjects,
        });

        const userPayment = await newPayment.save();

        res.status(201).json({
            status: 201,
            message: "customer genrated successfully",
            data: userPayment,
        });
        console.log(req.body);

    } catch (error) {
        console.log(error.message);
    }
};

export const details = async (req, res, next) => {
    try {

        const payment = await Payment.find();
        res.status(201).json({ status: 201, message: "get all data successfully.", data: payment });

    } catch (error) {
        console.log(error.message);
    }
};

export const deleteReceipt = async (req, res, next) => {
    try {

        await Payment.findByIdAndDelete(req.params.id)
        res.status(200).json('User has been deleted');

    } catch (error) {
        console.log(error.message);
    }
};

export const getCurrentReceipt = async (req, res, next) => {
    try {

        const currentReceipt = await Payment.findById(req.params.id);
        res.status(201).json({ status: 201, message: "Get current user successfully", data: currentReceipt });

    } catch (error) {
        console.log(error.message)
    }
};

// export const updateReceipt = async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         const fid = await Payment.findById(id);
//         if (!fid) {
//             throw Error('not available');
//         }

//         const updateUserReceipt = await Payment.findByIdAndUpdate(
//             id,
//             {
//                 $set: {
//                     receiptNumber: req.body.receiptNumber,
//                     customerName: req.body.customerName,
//                     customerMobileNumber: req.body.customerMobileNumber,
//                     paymentDate: req.body.paymentDate,
//                     paidAmount: req.body.paidAmount,
//                     invoiceNumber: req.body.invoiceNumber,
//                     paymentype: req.body.paymentype,
//                     totalAmount: req.body.totalAmount,
//                     lastPaidAmount: req.body.lastPaidAmount,
//                     pendingAmount: req.body.pendingAmount,
//                 },
//             },
//             { new: true },
//         );

//         res.status(201).json({ status: 201, message: "update successfully", data: updateUserReceipt._doc });
//     } catch (error) {
//         console.log(error.message);
//     }
// };

export const updateReceipt = async (req, res, next) => {
    try {
        const id = req.params.id;
        const existingPayment = await Payment.findById(id);
        if (!existingPayment) {
            throw Error('not available');
        }

        const newPayment = new Payment({
            receiptNumber: req.body.receiptNumber,
            customerName: req.body.customerName,
            customerMobileNumber: req.body.customerMobileNumber,
            receiptDate: req.body.receiptDate,
            paidAmount: req.body.paidAmount,
            invoiceNumber: req.body.invoiceNumber,
            paymentype: req.body.paymentype,
            totalAmount: req.body.totalAmount,
            lastPaidAmount: req.body.lastPaidAmount,
            pendingAmount: req.body.pendingAmount,
            invoices: req.body.invoices,
        });

        const savedPayment = await newPayment.save();

        res.status(201).json({ status: 201, message: "created successfully", data: savedPayment._doc });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};