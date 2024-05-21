import Customer from "../models/customer.model.js";

export const customer = async(req, res, next) => {
    try {

        const {
            customerName,
            customerMobileNumber,
            gstNumber,
            accountStatus,
        } = req.body;

        const newCustomer = new Customer({
            customerName,
            customerMobileNumber,
            gstNumber,
            accountStatus,
        });

        const userCustomer = await newCustomer.save();

        res.status(201).json({
            status: 201,
            message: "customer genrated successfully",
            data: userCustomer,
        });
        console.log(req.body);

    } catch (error) {
        console.log(error.message);
    }
};

export const details = async(req, res, next) => {
    try {

        const customer = await Customer.find();
        res.status(201).json({ status: 201, message: "get all data successfully.", data: customer });

    } catch (error) {
        console.log(error.message);
    }
};

export const deleteCustomer = async(req, res, next) => {
    try {

        await Customer.findByIdAndDelete(req.params.id)
        res.status(200).json('User has been deleted');

    } catch (error) {
        console.log(error.message);
    }
};

export const getCurrentCustomers = async(req, res, next) => {
    try {

        const currentCustomer = await Customer.findById(req.params.id);
        res.status(201).json({ status: 201, message: "Get current user successfully", data: currentCustomer });

    } catch (error) {
        console.log(error.message)
    }
};

export const updateCustomer = async(req, res, next) => {
    try {
        const id = req.params.id;
        const fid = await Customer.findById(id);
        if (!fid) {
            throw Error('not available');
        }

        const updateUserCustomer = await Customer.findByIdAndUpdate(
            id,
            {
                $set: {
                    customerName: req.body.customerName,
                    customerMobileNumber: req.body.customerMobileNumber,
                    gstNumber: req.body.gstNumber,
                    accountStatus: req.body.accountStatus,
                },
            },
            { new: true },
        );

        res.status(201).json({ status: 201, message: "update successfully", data: updateUserCustomer._doc });
    } catch (error) {
        console.log(error.message);
    }
};