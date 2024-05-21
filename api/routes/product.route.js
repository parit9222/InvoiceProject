import express from "express";
import { deleteProduct, details, getCurrentProduct, product, updateProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.post('/prod', product);
router.get('/details', details);
router.delete('/productDelete/:id', deleteProduct);
router.get('/currentUserProduct/:id', getCurrentProduct);
router.put('/update/:id', updateProduct);



export default router;