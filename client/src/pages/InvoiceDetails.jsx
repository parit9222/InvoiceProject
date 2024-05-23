import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';


export default function InvoiceDetails() {
    const [users, setUsers] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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


    const [productName, setProductName] = useState([]);
    const [productUsers, setProductUsers] = useState([]);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/product/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                const activeProductNames = data.data.map(product => product.productsName);

                setProductName(activeProductNames);

                setProductUsers(data.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);




    const handleDeleteData = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    // const handleConfirmDelete = async () => {
    //     try {
    //         const res = await fetch(`/api/user/delete/${deleteId}`, {
    //             method: 'DELETE',
    //         });
    //         if (!res.ok) {
    //             throw new Error('Failed to delete record');
    //         }
    //         // Update state after successful deletion
    //         setUsers((prev) => prev.filter((user) => user._id !== deleteId));
    //     } catch (error) {
    //         console.log('Error deleting record:', error.message);
    //     } finally {
    //         // Reset state
    //         setOpenDeleteDialog(false);
    //         setDeleteId(null);
    //     }
    // };



    // const handleConfirmDelete = async () => {
    //     try {
    //         const res = await fetch(`/api/user/delete/${deleteId}`, {
    //             method: 'DELETE',
    //         });
    //         if (!res.ok) {
    //             throw new Error('Failed to delete record');
    //         }
    //         setUsers((prev) => prev.filter((user) => user._id !== deleteId));
    
    //         if (deleteId && productUsers.length > 0) {
    //             const deletedUser = users.find((user) => user._id === deleteId);
    //             if (deletedUser) {
    //                 deletedUser.items.forEach(async(item) => {
    //                     // console.log(item);
    //                     const productToUpdate = productUsers.find((product) => {product._id === item.productId});
    //                     console.log(productToUpdate);
    //                     if (productToUpdate) {
    //                         const updatedQty = (+productToUpdate.qty) + (+item.qty); 
    //                         try {
    //                             const res = await fetch(`/api/product/update/${productToUpdate._id}`, {
    //                                 method: "PUT",
    //                                 headers: {
    //                                     "Content-Type": "application/json",
    //                                 },
    //                                 body: JSON.stringify({ productId: productToUpdate._id, qty: updatedQty }),
    //                             });
    //                             const updateqty = await res.json();
    //                             console.log(updateqty);
                    
    //                         } catch (error) {
    //                             console.error('Error updating product quantity:', error);
    //                         }
    //                     }
    //                 });
    //             }
    //         }
    //     } catch (error) {
    //         console.log('Error deleting record:', error.message);
    //     } finally {
    //         // Reset state
    //         setOpenDeleteDialog(false);
    //         setDeleteId(null);
    //     }
    // };

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
                        console.log(productToUpdate);
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
            // Reset state
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
                <Link to={'/invoice'}>
                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add Invoice</button>
                </Link>
            </div>

            <table className="table-auto max-w-lg mx-auto mt-5">
                <thead>
                    <tr>
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
                                        <td>
                                            <Link to={`/updateInvoice/${user._id}`}>
                                                <button className="text-green-600 uppercase hover:opacity-95 rounded-3xl px-2 py-2">Update</button>
                                            </Link>
                                        </td>
                                        <td>
                                            <button onClick={() => handleDeleteData(user._id)} className="text-red-600 uppercase hover:opacity-95 rounded-3xl px-2 py-2">Delete</button>
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
    )
}
