import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function DetailStock() {
    const [users, setUsers] = useState([]);
    const [stock, setStock] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [filterProductName, setFilterProductName] = useState('');
    const [selectedProductName, setSelectedProductName] = useState(''); 

    const location = useLocation();

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
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/stock/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setStock(data.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!selectedProductName) return; 

            try {
                const response = await fetch(`/api/product/details?productName=${encodeURIComponent(selectedProductName)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                const activeProductDetails = data.data;

                setGroupedData({});
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        };
        fetchProductDetails();
    }, [selectedProductName]);

    useEffect(() => {
        const updatedCombinedData = [
            ...users.flatMap(user => user.items.map(item => ({
                productName: item.productname,
                date: user.purchaseDate,
                purchaseQty: "",
                sellQty: item.qty,
                balanceQty: "",
                invoiceNumber: user.invoiceNumber,
                customerName: user.customerName,
                customerMobileNumber: user.customerMobileNumber,
                purchaseRate: "",
                purchaseAmount: "" 
            }))),
            ...stock.map(stockItem => ({
                productName: stockItem.productsName,
                date: stockItem.newStockDate,
                purchaseQty: stockItem.qty,
                sellQty: "",
                balanceQty: "",
                invoiceNumber: stockItem.invoiceNumber,
                customerName: "",
                customerMobileNumber: "",
                purchaseRate: stockItem.rate,
                purchaseAmount: "" 
            }))
        ];

        const updatedCombinedDataWithAmount = updatedCombinedData.map(item => ({
            ...item,
            purchaseAmount: item.purchaseQty * item.purchaseRate 
        }));

        updatedCombinedDataWithAmount.sort((a, b) => {
            const dateA = new Date(
                a.date.split('-').reverse().join('-')
            );
            const dateB = new Date(
                b.date.split('-').reverse().join('-')
            );
            return dateA - dateB;
        });

        setCombinedData(updatedCombinedDataWithAmount);
    }, [users, stock]);

    useEffect(() => {
        if (combinedData.length === 0) return; 

        const groupedAndTotalledData = combinedData.reduce((groups, item) => {
            const groupName = item.productName;
            if (!groups[groupName]) {
                groups[groupName] = {
                    items: [],
                    totals: {
                        purchaseQty: 0,
                        sellQty: 0,
                        purchaseRate: 0,
                        purchaseAmount: 0,
                        balanceQty: 0, 
                        balanceAmount: 0
                    }
                };
            }
            groups[groupName].items.push(item);
            groups[groupName].totals.purchaseQty += Number(item.purchaseQty);
            groups[groupName].totals.sellQty += Number(item.sellQty);
            groups[groupName].totals.purchaseRate += Number(item.purchaseRate);
            groups[groupName].totals.purchaseAmount += Number(item.purchaseAmount);
            return groups;
        }, {});

        Object.keys(groupedAndTotalledData).forEach(productName => {
            let currentBalance = 0;
            groupedAndTotalledData[productName].items.forEach(item => {
                if (item.purchaseQty !== "") {
                    currentBalance += Number(item.purchaseQty);
                } else if (item.sellQty !== "") {
                    currentBalance -= Number(item.sellQty);
                }
                item.balanceQty = currentBalance;
                item.balanceAmount = (item.purchaseAmount / item.purchaseQty) * item.balanceQty; 
            });
            groupedAndTotalledData[productName].totals.balanceQty = currentBalance;
            groupedAndTotalledData[productName].totals.balanceAmount = (groupedAndTotalledData[productName].totals.purchaseAmount / groupedAndTotalledData[productName].totals.purchaseQty) * currentBalance; 
        });

        setGroupedData(groupedAndTotalledData);
    }, [combinedData]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const productNameFromQuery = queryParams.get('productName');
        if (productNameFromQuery) {
            setFilterProductName(productNameFromQuery);
            setSelectedProductName(productNameFromQuery);
        }
    }, [location.search]);

    const handleFilterChange = (event) => {
        setFilterProductName(event.target.value);
    };

    const filteredGroupedData = Object.keys(groupedData)
        .filter(productName => productName.toLowerCase().startsWith(filterProductName.toLowerCase()))
        .reduce((obj, key) => {
            obj[key] = groupedData[key];
            return obj;
        }, {});

    const selectProductName = (productName) => {
        setSelectedProductName(productName);
    };

    return (
        <div className="container mx-auto">
            <div className="mt-10 text-center">
                <input
                    type="text"
                    value={filterProductName}
                    onChange={handleFilterChange}
                    placeholder="Filter by Product Name"
                    className="border w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
            </div>
            {Object.keys(filteredGroupedData).map((productName, index) => (
                <div key={index} className="mt-5">
                    <h2 className="text-xl font-semibold capitalize">{productName}</h2>
                    <table className="table-auto max-w-4xl mx-auto mt-3">
                        <thead>
                            <tr>
                                <th className="border px-12 py-2">Date</th>
                                <th className="border px-4 py-2">Purchase Quantity</th>
                                <th className="border px-4 py-2">Sell Quantity</th>
                                <th className="border px-4 py-2">Balance Quantity</th>
                                <th className="border px-4 py-2">Invoice Number</th>
                                <th className="border px-4 py-2">Customer/Vendor Name</th>
                                <th className="border px-4 py-2">Mobile Number</th>
                                <th className="border px-4 py-2">Purchase Rate</th>
                                <th className="border px-4 py-2">Purchase Amount</th>
                                <th className="border px-4 py-2">Balance Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGroupedData[productName].items.map((item, index) => (
                                <tr key={index}>
                                    <td className="border text-center px-4 py-2">{item.date}</td>
                                    <td className="border text-center px-4 py-2">{item.purchaseQty}</td>
                                    <td className="border text-center px-4 py-2">{item.sellQty}</td>
                                    <td className="border text-center px-4 py-2">{item.balanceQty}</td>
                                    <td className="border text-center px-4 py-2">{item.invoiceNumber}</td>
                                    <td className="border text-center px-4 py-2">{item.customerName}</td>
                                    <td className="border text-center px-4 py-2">{item.customerMobileNumber}</td>
                                    <td className="border text-center px-4 py-2">{item.purchaseRate}</td>
                                    <td className="border text-center px-4 py-2">{item.purchaseAmount}</td>
                                    <td className="border text-center px-4 py-2"></td>
                                </tr>
                            ))}
                            <tr className="font-semibold text-center">
                                <td className="border px-4 py-2">Total</td>
                                <td className="border px-4 py-2">{filteredGroupedData[productName].totals.purchaseQty}</td>
                                <td className="border px-4 py-2">{filteredGroupedData[productName].totals.sellQty}</td>
                                <td className="border px-4 py-2">{filteredGroupedData[productName].totals.balanceQty}</td>
                                <td className="border px-4 py-2" colSpan={3}></td>
                                <td className="border px-4 py-2">{filteredGroupedData[productName].totals.purchaseRate}</td>
                                <td className="border px-4 py-2">{filteredGroupedData[productName].totals.purchaseAmount}</td>
                                <td className="border px-4 py-2">{filteredGroupedData[productName].totals.balanceAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}
