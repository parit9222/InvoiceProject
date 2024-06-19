import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Checkbox } from '@mui/material';
import { FiPlusSquare } from "react-icons/fi";

export default function PaymentPopUp({ existingInvoices, open, onClose, onSelectInvoices }) {
    const [receipt, setReceipt] = useState([]);
    const [selectedRows, setSelectedRows] = useState({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/payment/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch payment details');
                }
                const data = await response.json();
                // Filter out existing invoices
                const filteredData = data.data.map(user => ({
                    ...user,
                    invoices: user.invoices.filter(invoice => 
                        !existingInvoices.some(existing => existing.invoiceNumber === invoice.invoiceNumber)
                    )
                })).filter(user => user.invoices.length > 0); // Remove users without invoices
                setReceipt(filteredData);
            } catch (error) {
                console.error('Error fetching payment details:', error);
            }
        };
        fetchUsers();
    }, [existingInvoices]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        onClose();
        setSelectedRows({});
    };

    const handleCheckboxChange = (userId, invoiceIndex) => {
        setSelectedRows((prevSelectedRows) => {
            const newSelectedRows = { ...prevSelectedRows };
            const rowKey = `${userId}-${invoiceIndex}`;
            if (newSelectedRows[rowKey]) {
                delete newSelectedRows[rowKey];
            } else {
                newSelectedRows[rowKey] = true;
            }
            return newSelectedRows;
        });
    };
// Inside PaymentPopUp function
const handleConfirm = () => {
    const selectedInvoiceDetails = [];
    receipt.forEach(user => {
        user.invoices.forEach((invoice, index) => {
            if (selectedRows[`${user._id}-${index}`]) {
                selectedInvoiceDetails.push({
                    userId: user._id,
                    ...invoice
                });
            }
        });
    });
    console.log('Selected invoices:', selectedInvoiceDetails);
    onClose(); // Close the pop-up box
    onSelectInvoices(selectedInvoiceDetails); // Pass selected invoices back to the main component
};


    return (
        <div className="container mx-auto">
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>Payment Details</DialogTitle>
                <DialogContent>
                    <table className="table-auto max-w-lg mx-auto mt-10">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Select</th>
                                <th className="border px-4 py-2">Invoice Number</th>
                                <th className="border px-4 py-2">Purchase Date</th>
                                <th className="border px-4 py-2">Total Amount</th>
                                <th className="border px-4 py-2">Pending Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.map((user) => (
                                user.invoices.map((invoice, index) => (
                                    <tr key={`${user._id}-${index}`}>
                                        <td className="border text-center px-4 py-2">
                                            <Checkbox
                                                checked={!!selectedRows[`${user._id}-${index}`]}
                                                onChange={() => handleCheckboxChange(user._id, index)}
                                            />
                                        </td>
                                        <td className="border text-center px-4 py-2">{invoice.invoiceNumber}</td>
                                        <td className="border text-center px-4 py-2">{invoice.purchaseDate}</td>
                                        <td className="border text-center font-semibold px-4 py-2">{invoice.totalAmount}</td>
                                        <td className="border text-center text-red-600 font-semibold px-4 py-2">{invoice.pendingAmount}</td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                    <Button onClick={handleConfirm}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
