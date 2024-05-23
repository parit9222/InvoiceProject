import Invoice from '../models/user.model.js';


export const invoice = async (req, res, next) => {
    try {

        const {
            invoiceNumber,
            customerName,
            customerMobileNumber,
            purchaseDate,
            items: itemData,
            totalDiscount,
            totalAmount,
        } = req.body;

        const itemObjects = itemData.map(item => ({
            productId: item.productId,
            productname: item.productname,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
            discountper: item.discountper,
            discountamount: item.discountamount
        }));

        const newInvoice = new Invoice({
            invoiceNumber,
            customerName,
            customerMobileNumber,
            purchaseDate,
            items: itemObjects,
            totalDiscount,
            totalAmount,
        });

        const userInvoice = await newInvoice.save();

        console.log('userInvoice', userInvoice);
        res.status(201).json({
            status: 201,
            message: "Invoice genrated successfully",
            data: userInvoice,
        });
        console.log(req.body);
    } catch (error) {
        console.log(error.message);
    }
};

export const details = async (req, res, next) => {
    try {
        const users = await Invoice.find();
        res.status(201).json({ status: 201, message: "get all data  successfully.", data: users });
    } catch (error) {
        console.log(error.message);
    }
};


export const deleteInvoice = async (req, res, next) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id)
        res.status(200).json('User has been deleted');
    } catch (error) {
        console.log(error.message);
    }
};


export const getCurrentUserInvoice = async (req, res, next) => {
    try {
        const currentUser = await Invoice.findById(req.params.id);
        res.status(201).json({ status: 201, message: "Get current user successfully", data: currentUser })
    } catch (error) {
        console.log(error.message)
    }
}


export const updateInvoice = async (req, res, next) => {
    try {
        const id = req.params.id;
        const fid = await Invoice.findById(id);
        if (!fid) {
            throw Error('not available');
        }

        const updateUser = await Invoice.findByIdAndUpdate(
            id,
            {
                $set: {
                    invoiceNumber: req.body.invoiceNumber,
                    customerName: req.body.customerName,
                    customerMobileNumber: req.body.customerMobileNumber,
                    purchaseDate: req.body.purchaseDate,
                    items: req.body.items,
                    totalDiscount: req.body.totalDiscount,
                    totalAmount: req.body.totalAmount,
                },
            },
            { new: true },
        );

        res.status(201).json({ status: 201, message: "update successfully", data: updateUser._doc });
    } catch (error) {
        console.log(error.message);
    }
};
