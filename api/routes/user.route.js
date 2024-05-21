import express from "express";
import { deleteInvoice, details, getCurrentUserInvoice, invoice, updateInvoice } from "../controllers/user.controller.js";

const router = express.Router();

router.post('/invoice', invoice);
router.get('/details', details);
router.delete('/delete/:id', deleteInvoice);
router.get('/currentUserInvoice/:id', getCurrentUserInvoice);
router.put('/update/:id', updateInvoice);

export default router;