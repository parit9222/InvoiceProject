import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AddPaymentPopup({ handleClosePopup }) {
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCustomerName, setSelectedCustomerName] = useState(null);

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

    return (
        <div>
            <div className="container mx-auto">
                <div className='flex gap-4 flex-1 mt-5'>
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
                                            <td rowSpan={user.items.length}>
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
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.totalAmount}</td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
