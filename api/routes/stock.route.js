import express from "express";
import { deleteStock, details, getCurrentStock, stock, updateStock } from "../controllers/stock.controller.js";

const router = express.Router();

router.post('/stock', stock);
router.get('/details', details);
router.delete('/stockDelete/:id', deleteStock);
router.get('/currentUserStock/:id', getCurrentStock);
router.put('/update/:id', updateStock);


export default router;