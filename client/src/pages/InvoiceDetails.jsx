import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

export default function InvoiceDetails() {
    const [users, setUsers] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCustomerName, setSelectedCustomerName] = useState(null);

    const [payment, setPayment] = useState([]);
    const [productName, setProductName] = useState([]);
    const [productUsers, setProductUsers] = useState([]);
    const [paymentSums, setPaymentSums] = useState({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/user/details');
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
        const fetchPaymentDetails = async () => {
            try {
                const response = await fetch('/api/payment/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch payment details');
                }
                const data = await response.json();
                setPayment(data.data);

                const paymentSums = data.data.reduce((acc, paymentDetail) => {
                    paymentDetail.invoices.forEach(invoice => {
                        if (!acc[invoice.invoiceNumber]) {
                            acc[invoice.invoiceNumber] = { paidAmount: 0 };
                        }
                        acc[invoice.invoiceNumber].paidAmount += +(invoice.paymentInvoice);
                    });
                    return acc;
                }, {});

                setPaymentSums(paymentSums);
            } catch (error) {
                console.error('Error fetching payment details:', error);
            }
        };
        fetchPaymentDetails();
    }, []);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch('/api/product/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                const activeProductNames = data.data.map(product => product.productsName);

                setProductName(activeProductNames);
                setProductUsers(data.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProductDetails();
    }, []);

    const handleCheckboxChange = (id, customerName) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                setSelectedCustomerName(null);
                return prev.filter((selectedId) => selectedId !== id);
            } else {
                setSelectedCustomerName(customerName);
                return [...prev, id];
            }
        });
    };

    const handleDeleteData = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await fetch(`/api/user/delete/${deleteId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                throw new Error('Failed to delete record');
            }
            setUsers((prev) => prev.filter((user) => user._id !== deleteId));

            if (deleteId && productUsers.length > 0) {
                const deletedUser = users.find((user) => user._id === deleteId);
                if (deletedUser) {
                    deletedUser.items.forEach(async (item) => {
                        const productToUpdate = productUsers.find((product) => product._id === item.productId);
                        if (productToUpdate) {
                            const updatedQty = (+productToUpdate.qty) + (+item.qty);
                            try {
                                const res = await fetch(`/api/product/update/${productToUpdate._id}`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ productId: productToUpdate._id, qty: updatedQty }),
                                });
                                const updateqty = await res.json();
                                console.log(updateqty);
                            } catch (error) {
                                console.error('Error updating product quantity:', error);
                            }
                        }
                    });
                }
            }
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

    const getPaymentDetails = (invoiceNumber) => {
        return paymentSums[invoiceNumber] || { paidAmount: 0};
    };

    return (
        <div className="container mx-auto">
            <div className='flex gap-4 flex-1 mt-5'>
                <div className='flex gap-6 mt-5'>
                    <Link to={'/invoice'}>
                        <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add Invoice</button>
                    </Link>
                </div>
                <div className='flex gap-6 mt-5'>
                    <Link to={`/payment/${selectedIds.join(',')}`}>
                        <button
                            className="p-3 px-6 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95"
                            disabled={selectedIds.length === 0}
                        >
                            Payment
                        </button>
                    </Link>
                </div>
            </div>

            <table className="table-auto max-w-4xl mx-auto mt-5">
                <thead>
                    <tr>
                        <th></th>
                        <th className="border px-4 py-2">Invoice Number</th>
                        <th className="border px-4 py-2">Customer Name</th>
                        <th className="border px-4 py-2">Mobile Number</th>
                        <th className="border px-4 py-2">Purchase Date</th>
                        <th className="border px-4 py-2">Product Name</th>
                        <th className="border px-4 py-2">Quantity</th>
                        <th className="border px-4 py-2">Rate</th>
                        <th className="border px-4 py-2">Amount</th>
                        <th className="border px-4 py-2">Discount %</th>
                        <th className="border px-4 py-2">Discount Amount</th>
                        <th className="border px-4 py-2">Total Discount</th>
                        <th className="border px-4 py-2">Total Amount</th>
                        <th className="border px-4 py-2">Paid Amount</th>
                        <th className="border px-4 py-2">Pending Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        user.items.map((item, index) => {
                            const { paidAmount } = getPaymentDetails(user.invoiceNumber);
                            return (
                                <tr key={`${user._id}-${index}`}>
                                    {index === 0 && (
                                        <>
                                            <td>
                                                {selectedCustomerName === null || selectedCustomerName === user.customerName ? (
                                                    <input
                                                        type='checkbox'
                                                        id='select'
                                                        className='w-4 h-4 mx-5'
                                                        checked={selectedIds.includes(user._id)}
                                                        onChange={() => handleCheckboxChange(user._id, user.customerName)}
                                                    />
                                                ) : null}
                                            </td>

                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.invoiceNumber}</td>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.customerName}</td>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.customerMobileNumber}</td>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.purchaseDate}</td>
                                        </>
                                    )}
                                    <td className="border text-center px-4 py-2">{item.productname}</td>
                                    <td className="border text-center px-4 py-2">{item.qty}</td>
                                    <td className="border text-center px-4 py-2">{item.rate}</td>
                                    <td className="border text-center px-4 py-2">{item.amount}</td>
                                    <td className="border text-center px-4 py-2">{item.discountper}</td>
                                    <td className="border text-center px-4 py-2">{item.discountamount}</td>
                                    {index === 0 && (
                                        <>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.totalDiscount}</td>
                                            <td className="border text-center font-semibold px-4 py-2" rowSpan={user.items.length}>{user.totalAmount}</td>
                                            <td className="border text-center text-green-600 font-semibold px-4 py-2" rowSpan={user.items.length}>{paidAmount}</td>
                                            <td className="border text-center text-red-600 font-semibold px-4 py-2" rowSpan={user.items.length}>{user.totalAmount - paidAmount}</td>
                                            <td>
                                                <Link to={`/updateInvoice/${user._id}`}>
                                                    <button className="text-green-600 font-semibold uppercase hover:opacity-95 rounded-3xl pl-6 px-3 py-2"><FaEdit className='h-6 w-6' /></button>
                                                </Link>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDeleteData(user._id)} className="text-red-600 font-semibold uppercase hover:opacity-95 rounded-3xl px-3 py-2"><MdDelete className='h-6 w-6' /></button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })
                    ))}
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
