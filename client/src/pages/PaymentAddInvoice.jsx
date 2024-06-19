import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

export default function PaymentAddInvoice({ open, onClose, customerName, invoiceNumber, onSelectInvoices }) {
    const [users, setUsers] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    console.log(selectedRows);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/user/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                
                if (customerName) {
                    const filteredUsers = data.data.filter(user => user.customerName === customerName);
                    setUsers(filteredUsers);
                } else {
                    setUsers(data.data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [customerName]);

    useEffect(() => {
        if (invoiceNumber) {
            const selectedUser = users.find(user => user.invoiceNumber === invoiceNumber);
            if (selectedUser) {
                setSelectedRows([{
                    invoiceNumber: selectedUser.invoiceNumber,
                    purchaseDate: selectedUser.purchaseDate,
                    totalAmount: selectedUser.totalAmount,
                }]);
            }
        }
    }, [users, invoiceNumber]);


    // const handleCheckboxChange = (user) => {
    //     setSelectedRows((prev) => {
    //         const isSelected = prev.find(row => row.invoiceNumber === user.invoiceNumber);
    //         if (isSelected) {
    //             return prev.filter(row => row.invoiceNumber !== user.invoiceNumber);
    //         } else {
    //             return [...prev, {
    //                 invoiceNumber: user.invoiceNumber,
    //                 purchaseDate: user.purchaseDate,
    //                 totalAmount: user.totalAmount,
    //             }];
    //         }
    //     });
    // };

    
    const handleCheckboxChange = (user) => {
        setSelectedRows((prev) => {
            const isSelected = prev.some(row => row.invoiceNumber === user.invoiceNumber);
            if (isSelected) {
                return prev.filter(row => row.invoiceNumber !== user.invoiceNumber);
            } else {
                return [...prev, {
                    invoiceNumber: user.invoiceNumber,
                    purchaseDate: user.purchaseDate,
                    totalAmount: user.totalAmount,
                }];
            }
        });
    };
    

    // const handleCheckboxChange = (user) => {
    //     setSelectedRows((prev) => {
    //         console.log(prev);
    //         const isSelected = prev.find(row => {
                
    //             row.invoiceNumber === user.invoiceNumber});
    //         console.log(isSelected);
    //         if (isSelected) {
    //             return prev.filter(row => row.invoiceNumber !== user.invoiceNumber);
    //         } else {
    //             return [...prev, {
    //                 invoiceNumber: user.invoiceNumber,
    //                 purchaseDate: user.purchaseDate,
    //                 totalAmount: user.totalAmount,
    //             }];
    //         }
    //     });
    // };
    
    

    const handleConfirm = () => {
        onSelectInvoices(selectedRows);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
            <DialogTitle>Select Invoices</DialogTitle>
            <DialogContent>
                <div className="container mx-auto">
                    <table className="table-auto max-w-lg mx-auto mt-5">
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
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                user.items.map((item, index) => (
                                    <tr key={`${user._id}-${index}`}>
                                        {index === 0 && (
                                            <>
                                                <td>
                                                    <input
                                                        type='checkbox'
                                                        id='select'
                                                        className='w-4 h-4 mx-5'
                                                        checked={selectedRows.some(row => row.invoiceNumber === user.invoiceNumber)}
                                                        onChange={() => handleCheckboxChange(user)}
                                                    />
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
                                                <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.totalAmount}</td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} color="primary" variant="contained">Confirm</Button>
            </DialogActions>
        </Dialog>
    );
}
