import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

export default function StockDetails() {

  const [products, setProducts] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/product/details');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/stock/details');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const productRowSpans = {};
  const productTotalQty = {};

  products.forEach((product) => {
    productRowSpans[product.productsName] = (productRowSpans[product.productsName] || 0) + 1;
    productTotalQty[product.productsName] = (productTotalQty[product.productsName] || 0) + +product.qty;
  });

  let lastProductName = '';

  const handleDeleteData = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const productToDelete = products.find((product) => product._id === deleteId);
      if (!productToDelete) {
        throw new Error('Product not found');
      }

      // Calculate new quantity
      const newQuantity = productTotalQty[productToDelete.productsName] - productToDelete.qty;

      // Update the product quantity in the users state
      const userToUpdate = users.find((user) => user.productsName === productToDelete.productsName);
      if (userToUpdate) {
        const updatedUser = { ...userToUpdate, qty: newQuantity };
        const res = await fetch(`/api/product/update/${userToUpdate._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ qty: newQuantity }),
        });
        if (!res.ok) {
          throw new Error('Failed to update product quantity');
        }
        setUsers((prev) => prev.map((user) => (user._id === userToUpdate._id ? updatedUser : user)));
      }

      // Delete the product from the products state
      const resDelete = await fetch(`/api/stock/stockDelete/${deleteId}`, {
        method: 'DELETE',
      });
      if (!resDelete.ok) {
        throw new Error('Failed to delete record');
      }
      setProducts((prev) => prev.filter((product) => product._id !== deleteId));
    } catch (error) {
      console.log('Error deleting record:', error.message);
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setDeleteId(null);
  };

  return (
    <div className="container mx-auto">
      <div className="flex gap-4 flex-1 mt-5">
        <Link to={'/stock'}>
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95">Add Products</button>
        </Link>
      </div>

      <table className="table-auto max-w-lg mx-auto mt-5">
        <thead>
          <tr>
            <th className="border px-4 py-2">Product Name</th>
            <th className="border px-4 py-2">Purchase Date</th>
            <th className="border px-4 py-2">Rate</th>
            <th className="border px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const showProductName = lastProductName !== product.productsName;
            lastProductName = product.productsName;

            return (
              <React.Fragment key={product._id}>
                <tr>
                  {showProductName && (
                    <td
                      className="border px-4 py-2 text-center align-middle"
                      rowSpan={productRowSpans[product.productsName]}
                    >
                      {product.productsName}
                    </td>
                  )}
                  <td className="border px-4 py-2">{product.newStockDate}</td>
                  <td className="border px-4 py-2">{product.rate}</td>
                  <td className="border px-4 py-2">{product.qty}</td>
                  <td>
                    <Link to={`/updateStock/${product._id}`}>
                      <button className="text-green-600 font-semibold uppercase hover:opacity-95 rounded-3xl pl-6 px-3 py-2">
                        <FaEdit className="h-6 w-6" />
                      </button>
                    </Link>
                  </td>

                  <td>
                    <button onClick={() => handleDeleteData(product._id)} className="text-red-600 font-semibold uppercase hover:opacity-95 rounded-3xl px-3 py-2">
                      <MdDelete className="h-6 w-6" />
                    </button>
                  </td>
                </tr>
                {index < products.length - 1 && products[index + 1].productsName !== product.productsName && (
                  <tr>
                    <td colSpan={3} className="border px-4 py-2 text-right font-bold">
                      Total Quantity: 
                    </td>
                    <td className="border px-4 py-2 text-right font-bold">
                      {productTotalQty[product.productsName]}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {products.length > 0 && (
            <tr>
              <td colSpan={3} className="border px-4 py-2 text-right font-bold">
                Total Quantity: 
              </td>
              <td className="border px-4 py-2 text-right font-bold">
                {productTotalQty[lastProductName]}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <p>You are about to delete this record. This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
