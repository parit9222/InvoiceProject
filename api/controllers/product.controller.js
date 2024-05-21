import Products from "../models/product.model.js";

export const product = async(req, res, next) => {
    try {

        const {
            productsName,
            qty,
            rate,
        } = req.body;

        const newProduct = new Products({
            productsName,
            qty,
            rate,
        });

        const userProducts = await newProduct.save();

        res.status(201).json({
            status: 201,
            message: "customer genrated successfully",
            data: userProducts,
        });
        console.log(req.body);

    } catch (error) {
        console.log(error.message);
    }
};

export const details = async(req, res, next) => {
    try {

        const product = await Products.find();
        res.status(201).json({ status: 201, message: "get all data successfully.", data: product });

    } catch (error) {
        console.log(error.message);
    }
};

export const deleteProduct = async(req, res, next) => {
    try {

        await Products.findByIdAndDelete(req.params.id)
        res.status(200).json('User has been deleted');

    } catch (error) {
        console.log(error.message);
    }
};

export const getCurrentProduct = async(req, res, next) => {
    try {

        const currentProduct = await Products.findById(req.params.id);
        res.status(201).json({ status: 201, message: "Get current user successfully", data: currentProduct });

    } catch (error) {
        console.log(error.message)
    }
};

export const updateProduct = async(req, res, next) => {
    try {
        const id = req.params.id;
        const fid = await Products.findById(id);
        if (!fid) {
            throw Error('not available');
        }

        const updateUserProduct = await Products.findByIdAndUpdate(
            id,
            {
                $set: {
                    productsName: req.body.productsName,
                    qty: req.body.qty,
                    rate: req.body.rate,
                },
            },
            { new: true },
        );

        res.status(201).json({ status: 201, message: "update successfully", data: updateUserProduct._doc });
    } catch (error) {
        console.log(error.message);
    }
};