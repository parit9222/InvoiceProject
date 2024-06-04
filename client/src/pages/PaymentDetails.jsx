import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

export default function PaymentDetails() {
    const [receipt, setReceipt] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/payment/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch payment details');
                }
                const data = await response.json();
                setReceipt(data.data);
            } catch (error) {
                console.error('Error fetching payment details:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleDeleteData = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await fetch(`/api/payment/receiptDelete/${deleteId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                throw new Error('Failed to delete record');
            }
            setReceipt((prev) => prev.filter((user) => user._id !== deleteId));
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
            <div className='flex gap-4 flex-1 mt-5'>
                <Link to={'/paymen'}>
                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add Receipts</button>
                </Link>
            </div>

            <table className="table-auto max-w-lg mx-auto mt-5">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Customer Name</th>
                        <th className="border px-4 py-2">Mobile Number</th>
                        <th className="border px-4 py-2">Invoice Number</th>
                        <th className="border px-4 py-2">Purchase Date</th>
                        <th className="border px-4 py-2">Total Amount</th>
                        <th className="border px-4 py-2">Pending Amount</th>
                        <th className="border px-4 py-2">Receipt Number</th>
                        <th className="border px-4 py-2">Receipt Date</th>
                        <th className="border px-4 py-2">Payment Type</th>
                        <th className="border px-4 py-2">Total Amount</th>
                        <th className="border px-4 py-2">Last Paid Amount</th>
                        <th className="border px-4 py-2">Pending Amount</th>
                    </tr>
                </thead>

                <tbody>
                    {receipt.map((user) => (
                        user.invoices.map((invoice, index) => (
                            <tr key={`${user._id}-${index}`}>
                                {index === 0 && (
                                    <>
                                        <td className="border text-center px-4 py-2" rowSpan={user.invoices.length}>{user.customerName}</td>
                                        <td className="border text-center px-4 py-2" rowSpan={user.invoices.length}>{user.customerMobileNumber}</td>
                                    </>
                                )}
                                <td className="border text-center px-4 py-2">{invoice.invoiceNumber}</td>
                                <td className="border text-center px-4 py-2">{invoice.purchaseDate}</td>
                                <td className="border text-center font-semibold px-4 py-2">{invoice.totalAmount}</td>
                                <td className="border text-center text-red-600 font-semibold px-4 py-2">{invoice.pendingAmount}</td>
                                {index === 0 && (
                                    <>
                                <td className="border px-4 py-2" rowSpan={user.invoices.length}>{user.receiptNumber}</td>
                                <td className="border px-4 py-2" rowSpan={user.invoices.length}>{user.receiptDate}</td>
                                <td className="border px-4 py-2" rowSpan={user.invoices.length}>{user.paymentype}</td>
                                <td className="border font-semibold px-4 py-2" rowSpan={user.invoices.length}>{user.totalAmount}</td>
                                <td className="border text-green-600 font-semibold px-4 py-2" rowSpan={user.invoices.length}>{user.lastPaidAmount}</td>
                                <td className="border text-red-600 font-semibold px-4 py-2" rowSpan={user.invoices.length}>{user.pendingAmount}</td>
                                <td>
                                    <Link to={`/updatePayment/${user._id}`}>
                                        <button className="text-green-600 font-semibold uppercase hover:opacity-95 rounded-3xl px-2 py-2">Add</button>
                                    </Link>
                                </td>
                                <td>
                                    <button onClick={() => handleDeleteData(user._id)} className="text-red-600 font-semibold uppercase hover:opacity-95 rounded-3xl px-2 py-2">Delete</button>
                                </td>
                                </>
                                )}
                            </tr>
                        ))
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
