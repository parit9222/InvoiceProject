import express from "express";
import { deleteReceipt, details, getCurrentReceipt, payment, updateReceipt } from "../controllers/payment.controller.js";

const router = express.Router();

router.post('/Receipt', payment);
router.get('/details', details);
router.delete('/receiptDelete/:id', deleteReceipt);
router.get('/currentUserReceipt/:id', getCurrentReceipt);
router.put('/update/:id', updateReceipt);




export default router;