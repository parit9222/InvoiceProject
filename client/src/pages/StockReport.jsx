import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function StockReport() {
  const [users, setUsers] = useState([]);
  const [qty, setQty] = useState([]);
  const [price, setPrice] = useState([]);
  console.log(price);

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

    const fetchQty = async () => {
      try {
        const response = await fetch('/api/stock/details');
        if (!response.ok) {
          throw new Error('Failed to fetch stock details');
        }
        const data = await response.json();
        setQty(data.data);
      } catch (error) {
        console.error('Error fetching stock details:', error);
      }
    };

    const fetchProductDetails = async () => {
      try {
        const response = await fetch('/api/user/details');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();

        setPrice(data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProductDetails();
    fetchUsers();
    fetchQty();
  }, []);

  const calculateTotalQty = (productName) => {
    let totalQty = 0;
    qty.forEach((item) => {
      if (item.productsName === productName) {
        totalQty += +item.qty;
      }
    });
    return totalQty;
  };

  const calculateSellQty = (productName, presentQty) => {
    const totalQty = calculateTotalQty(productName);
    return totalQty - presentQty;
  };

  const calculatePurchaseAmount = (productName) => {
    let purchaseAmount = 0;
    qty.forEach((item) => {
      if (item.productsName === productName) {
        purchaseAmount += +item.qty * +item.rate;
      }
    });
    return purchaseAmount;
  };

  const calculateSellAmount = (productName, sellQty) => {
    let sellAmount = 0;
    price.forEach((entry) => {
      entry.items.forEach((item) => {
        if (item.productname === productName) {
          sellAmount += +item.amount;
        }
      });
    });
    return sellAmount;
  };

  const calculateBalanceAmount = (productName, balanceQty) => {
    const totalQty = calculateTotalQty(productName);
    const purchaseAmount = calculatePurchaseAmount(productName);
    if (totalQty === 0) return 0;
    const purchasePricePerUnit = purchaseAmount / totalQty;
    return (purchasePricePerUnit * balanceQty).toFixed();
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col mt-8">
        <Link to={'/detailStock'}>
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95">Details Report</button>
        </Link>
      </div>
      <table className="table-auto max-w-lg mx-auto mt-10">
        <thead>
          <tr>
            <th className="border px-4 py-2">Product Name</th>
            <th className="border px-4 py-2">Purchase Quantity</th>
            <th className="border px-4 py-2">Sell Quantity</th>
            <th className="border px-4 py-2">Balance Quantity</th>
            <th className="border px-4 py-2">Purchase Amount</th>
            <th className="border px-4 py-2">Sell Amount</th>
            <th className="border px-4 py-2">Balance Amount</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border text-center px-4 py-2">
                <Link to={`/detailStock?productName=${encodeURIComponent(user.productsName)}`}>
                  {user.productsName}
                </Link>
              </td>
              <td className="border text-center font-semibold px-4 py-2">
                {calculateTotalQty(user.productsName)}
              </td>
              <td className="border text-center font-semibold px-4 py-2">
                {calculateSellQty(user.productsName, user.qty)}
              </td>
              <td className="border text-center font-semibold px-4 py-2">{user.qty}</td>
              <td className="border text-center font-semibold px-4 py-2">
                {calculatePurchaseAmount(user.productsName)}
              </td>
              <td className="border text-center font-semibold px-4 py-2">
                {calculateSellAmount(user.productsName, calculateSellQty(user.productsName, user.qty))}
              </td>
              <td className="border text-center font-semibold px-4 py-2">
                {calculateBalanceAmount(user.productsName, user.qty)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
