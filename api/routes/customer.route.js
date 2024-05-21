import express from "express";
import { customer, deleteCustomer, details, getCurrentCustomers, updateCustomer } from "../controllers/customer.controller.js";

const router = express.Router();

router.post('/cust', customer);
router.get('/details', details);
router.delete('/customerDelete/:id', deleteCustomer);
router.put('/update/:id', updateCustomer);
router.get('/currentUserCustomer/:id', getCurrentCustomers);

export default router;