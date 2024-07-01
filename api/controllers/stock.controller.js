import Stock from "../models/stock.model.js";

export const stock = async(req, res, next) => {
    try {

        const {
            invoiceNumber,
            productsName,
            qty,
            newStockDate,
            rate,
            stockAmount,
        } = req.body;

        const newStock = new Stock({
            invoiceNumber,
            productsName,
            qty,
            newStockDate,
            rate,
            stockAmount,
        });

        const userStock = await newStock.save();

        res.status(201).json({
            status: 201,
            message: "customer genrated successfully",
            data: userStock,
        });
        console.log(req.body);

    } catch (error) {
        console.log(error.message);
    }
};

export const details = async(req, res, next) => {
    try {

        const stock = await Stock.find();
        res.status(201).json({ status: 201, message: "get all data successfully.", data: stock });

    } catch (error) {
        console.log(error.message);
    }
};

export const deleteStock = async(req, res, next) => {
    try {

        await Stock.findByIdAndDelete(req.params.id)
        res.status(200).json('User has been deleted');

    } catch (error) {
        console.log(error.message);
    }
};

export const getCurrentStock = async(req, res, next) => {
    try {

        const currentStock = await Stock.findById(req.params.id);
        res.status(201).json({ status: 201, message: "Get current user successfully", data: currentStock });

    } catch (error) {
        console.log(error.message)
    }
};

export const updateStock = async(req, res, next) => {
    try {
        const id = req.params.id;
        const fid = await Stock.findById(id);
        if (!fid) {
            throw Error('not available');
        }

        const updateUserStock = await Stock.findByIdAndUpdate(
            id,
            {
                $set: {
                    invoiceNumber: req.body.invoiceNumber,
                    productsName: req.body.productsName,
                    qty: req.body.qty,
                    newStockDate: req.body.newStockDate,
                    rate: req.body.rate,
                    stockAmount: req.body.stockAmount,
                },
            },
            { new: true },
        );

        res.status(201).json({ status: 201, message: "update successfully", data: updateUserStock._doc });
    } catch (error) {
        console.log(error.message);
    }
};