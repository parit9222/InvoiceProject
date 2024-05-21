import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

export default function CustomerDetails() {
    const [users, setUsers] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/customer/details');
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

    const handleDeleteData = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await fetch(`/api/customer/customerDelete/${deleteId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                throw new Error('Failed to delete record');
            }
            setUsers((prev) => prev.filter((user) => user._id !== deleteId));
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
                <Link to={'/customer'}>
                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add Customer</button>
                </Link>
            </div>

            <table className="table-auto max-w-lg mx-auto mt-5">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Customer Name</th>
                        <th className="border px-4 py-2">Mobile Number</th>
                        <th className="border px-4 py-2">GST Number</th>
                        <th className="border px-4 py-2">Account Status</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="border text-center px-4 py-2">{user.customerName}</td>
                            <td className="border text-center px-4 py-2">{user.customerMobileNumber}</td>
                            <td className="border text-center px-4 py-2">{user.gstNumber}</td>
                            <td className="border text-center px-4 py-2">{user.accountStatus}</td>
                            <td>
                                <Link to={`/updateCustomer/${user._id}`}>
                                <button className="text-green-600 uppercase hover:opacity-95 rounded-3xl px-2 py-2">Update</button>
                                </Link>
                            </td>
                            <td>
                                <button onClick={() => handleDeleteData(user._id)} className="text-red-600 uppercase hover:opacity-95 rounded-3xl px-2 py-2">Delete</button>
                            </td>
                        </tr>
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
