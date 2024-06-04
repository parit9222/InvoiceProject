import React, { useEffect, useState } from 'react';

export default function Report() {
    const [users, setUsers] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);

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

        const fetchReceipts = async () => {
            try {
                const response = await fetch('/api/payment/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch receipts');
                }
                const data = await response.json();
                setReceipts(data.data);
            } catch (error) {
                console.error('Error fetching receipts:', error);
            }
        };

        const fetchData = async () => {
            await fetchUsers();
            await fetchReceipts();
            setLoading(false);
        };

        fetchData();
    }, []);

    const mergeData = () => {
        const uniqueUsers = [];
        const customerNames = new Set();

        users.forEach(user => {
            if (!customerNames.has(user.customerName)) {
                customerNames.add(user.customerName);
                const userReceipts = receipts.filter(receipt => receipt.customerName === user.customerName);
                uniqueUsers.push({ ...user, receipts: userReceipts });
            }
        });

        return uniqueUsers;
    };
    const mergedData = mergeData();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto">
            <table className="table-auto max-w-lg mx-auto mt-10">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Invoice Number</th>
                        {/* <th className="border px-4 py-2">Purchase Date</th> */}
                        <th className="border px-4 py-2">Customer Name</th>
                        <th className="border px-4 py-2">Mobile Number</th>
                        {/* <th className="border px-4 py-2">Product Name</th>
                        <th className="border px-4 py-2">Quantity</th>
                        <th className="border px-4 py-2">Rate</th> */}
                        <th className="border px-4 py-2">Receipt Number</th>
                        <th className="border px-4 py-2">Receipt Date</th>
                        <th className="border px-4 py-2">Payment Type</th>
                        <th className="border px-4 py-2">Total Amount</th>
                        <th className="border px-4 py-2">Last Paid Amount</th>
                        <th className="border px-4 py-2">Pending Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {mergedData.map(user => (
                        user.items.map((item, itemIndex) => (
                            <React.Fragment key={`${user._id}-${itemIndex}`}>
                                <tr>
                                    {itemIndex === 0 && (
                                        <>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.receipts[0].invoiceNumber}</td>
                                            {/* <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.purchaseDate}</td> */}
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.customerName}</td>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.customerMobileNumber}</td>
                                        </>
                                    )}
                                    {/* <td className="border text-center px-4 py-2">{item.productname}</td>
                                    <td className="border text-center px-4 py-2">{item.qty}</td>
                                    <td className="border text-center px-4 py-2">{item.rate}</td> */}
                                    {itemIndex === 0 && user.receipts.length > 0 && (
                                        <>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.receipts[0].receiptNumber}</td>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.receipts[0].receiptDate}</td>
                                            <td className="border text-center px-4 py-2" rowSpan={user.items.length}>{user.receipts[0].paymentype}</td>
                                            <td className="border font-semibold text-center px-4 py-2" rowSpan={user.items.length}>{user.receipts[0].totalAmount}</td>
                                            <td className="border text-green-600 font-semibold text-center px-4 py-2" rowSpan={user.items.length}>{user.receipts[0].lastPaidAmount}</td>
                                            <td className="border text-red-600 font-semibold text-center px-4 py-2" rowSpan={user.items.length}>{user.receipts[0].pendingAmount}</td>
                                        </>
                                    )}
                                </tr>
                                {user.receipts.length > 1 && itemIndex === user.items.length - 1 && user.receipts.slice(1).map((receipt, receiptIndex) => (
                                    <tr key={`${user._id}-receipt-${receiptIndex}`}>
                                        <td className="border text-center px-4 py-2" colSpan={3}></td>
                                        <td className="border text-center px-4 py-2">{receipt.receiptNumber}</td>
                                        <td className="border text-center px-4 py-2">{receipt.receiptDate}</td>
                                        <td className="border text-center px-4 py-2">{receipt.paymentype}</td>
                                        <td className="border font-semibold text-center px-4 py-2">{receipt.totalAmount}</td>
                                        <td className="border text-green-600 font-semibold text-center px-4 py-2">{receipt.lastPaidAmount}</td>
                                        <td className="border text-red-600 font-semibold text-center px-4 py-2">{receipt.pendingAmount}</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))
                    ))}
                </tbody>
            </table>
        </div>
    );
}
