import React, { useEffect, useState } from 'react';
import { RiPaypalFill } from "react-icons/ri";
import { Link } from 'react-router-dom';

export default function Report() {
  const [receipt, setReceipt] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [daysSincePurchase, setDaysSincePurchase] = useState('');

  const fetchUsers = async (invoiceNumber, receiptNumber, customerName) => {
    try {
      let url = '/api/payment/details';
      const params = new URLSearchParams();
      if (invoiceNumber) params.append('invoiceNumber', invoiceNumber);
      if (receiptNumber) params.append('receiptNumber', receiptNumber);
      if (customerName) params.append('customerName', customerName);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      const data = await response.json();
      setReceipt(data.data);
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  useEffect(() => {
    fetchUsers(invoiceNumber, receiptNumber, customerName);
  }, [invoiceNumber, receiptNumber, customerName]);

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

  const getMissingInvoices = () => {
    return users.filter(user => !receipt.some(r => r.invoices && r.invoices.some(i => i.invoiceNumber === user.invoiceNumber)));
  };

  const calculateDateDifference = (purchaseDate) => {
    try {
      const presentDate = new Date();
      const [day, month, year] = purchaseDate.split('-');
      const parsedPurchaseDate = new Date(`${year}-${month}-${day}`);

      if (isNaN(parsedPurchaseDate.getTime())) {
        console.error(`Invalid date format: ${purchaseDate}`);
        return 'Invalid Date';
      }

      const differenceInTime = presentDate - parsedPurchaseDate;
      const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
      return differenceInDays;
    } catch (error) {
      console.error(`Error calculating date difference: ${error}`);
      return 'Error';
    }
  };

  const filteredReceipts = receipt.filter(user => {
    return (!receiptNumber || user.receiptNumber === receiptNumber) &&
      (!customerName || user.customerName.toLowerCase().includes(customerName.toLowerCase())) &&
      (!daysSincePurchase || (user.invoices && user.invoices.some(invoice => calculateDateDifference(invoice.purchaseDate) >= parseInt(daysSincePurchase)))) &&
      (!invoiceNumber || (user.invoices && user.invoices.some(invoice => invoice.invoiceNumber.includes(invoiceNumber))));
  });

  const missingInvoices = getMissingInvoices().filter(user => {
    return (!invoiceNumber || user.invoiceNumber.includes(invoiceNumber)) &&
      (!receiptNumber || user.receiptNumber === receiptNumber) &&
      (!customerName || user.customerName.toLowerCase().includes(customerName.toLowerCase())) &&
      (!daysSincePurchase || calculateDateDifference(user.purchaseDate) >= parseInt(daysSincePurchase));
  });

  return (
    <div className="container mx-auto mt-10">
      <div className="flex justify-center mb-5">
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="Enter Invoice Number"
          className='border-2 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 mr-2'
        />
        <input
          type="text"
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
          placeholder="Enter Receipt Number"
          className='border-2 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 mr-2'
        />
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter Customer Name"
          className='border-2 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 mr-2'
        />
        <input
          type="text"
          value={daysSincePurchase}
          onChange={(e) => setDaysSincePurchase(e.target.value)}
          placeholder="Enter Days Since Purchase"
          className='border-2 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
        />
      </div>

      <table className="table-auto max-w-lg mx-auto mt-10">
        <thead>
          <tr>
            <th className="border px-4 py-2">Customer Name</th>
            <th className="border px-4 py-2">Mobile Number</th>
            <th className="border px-4 py-2">Invoice Number</th>
            <th className="border px-4 py-2">Purchase Date</th>
            <th className="border px-4 py-2">Days Since Purchase</th>
            <th className="border px-4 py-2">Total Amount</th>
            <th className="border px-4 py-2">Paid Amount</th>
            <th className="border px-4 py-2">Pending Amount</th>
            <th className="border px-4 py-2">Receipt Number</th>
            <th className="border px-4 py-2">Receipt Date</th>
            <th className="border px-4 py-2">Payment Type</th>
            <th className="border px-4 py-2">Pending Amount</th>
          </tr>
        </thead>

        <tbody>
          {filteredReceipts.map((user) => {
            const filteredInvoices = user.invoices && user.invoices.filter(invoice => (!daysSincePurchase || calculateDateDifference(invoice.purchaseDate) >= parseInt(daysSincePurchase)) &&
              (!invoiceNumber || invoice.invoiceNumber.includes(invoiceNumber)));
            return filteredInvoices && filteredInvoices.map((invoice, index) => (
              <tr key={`${user._id}-${index}`}>
                {index === 0 && (
                  <>
                    <td className="border text-center px-4 py-2" rowSpan={filteredInvoices.length}>{user.customerName}</td>
                    <td className="border text-center px-4 py-2" rowSpan={filteredInvoices.length}>{user.customerMobileNumber}</td>
                  </>
                )}
                <td className="border text-center px-4 py-2">{invoice.invoiceNumber}</td>
                <td className="border text-center px-4 py-2">{invoice.purchaseDate}</td>
                <td className="border text-center px-4 py-2">{calculateDateDifference(invoice.purchaseDate)}</td>
                <td className="border text-center font-semibold px-4 py-2">{invoice.totalAmount}</td>
                <td className="border text-center text-green-600 font-semibold px-4 py-2">{invoice.paymentInvoice}</td>
                <td className="border text-center text-red-600 font-semibold px-4 py-2">{invoice.pendingAmount}</td>
                {index === 0 && (
                  <>
                    <td className="border px-4 py-2" rowSpan={filteredInvoices.length}>{user.receiptNumber}</td>
                    <td className="border px-4 py-2" rowSpan={filteredInvoices.length}>{user.receiptDate}</td>
                    <td className="border px-4 py-2" rowSpan={filteredInvoices.length}>{user.paymentype}</td>
                    <td className="border text-red-600 font-semibold px-4 py-2" rowSpan={filteredInvoices.length}>{user.pendingAmount}</td>
                  </>
                )}
              </tr>
            ));
          })}

          {missingInvoices.map((user, index) => (
            <tr key={`${user._id}-${index}`}>
              <td className="border text-center px-4 py-2">{user.customerName}</td>
              <td className="border text-center px-4 py-2">{user.customerMobileNumber}</td>
              <td className="border text-center px-4 py-2">{user.invoiceNumber}</td>
              <td className="border text-center px-4 py-2">{user.purchaseDate}</td>
              <td className="border text-center px-4 py-2">{calculateDateDifference(user.purchaseDate)}</td>
              <td className="border text-center font-semibold px-4 py-2">{user.totalAmount}</td>
              <td className="border text-center text-green-600 font-semibold px-4 py-2">{user.paymentInvoice}</td>
              <td className="border text-center text-red-600 font-semibold px-4 py-2">{user.pendingAmount}</td>
              <td className="border px-4 py-2">{user.receiptNumber}</td>
              <td className="border px-4 py-2">{user.receiptDate}</td>
              <td className="border px-4 py-2">{user.paymentype}</td>
              <td className="border text-red-600 font-semibold px-4 py-2">{user.pendingAmount}</td>
              <td>
                <Link to={`/payment/${user._id}`}>
                  <button className="text-blue-600 font-semibold uppercase hover:opacity-95 rounded-3xl px-3 pl-6 py-2"><RiPaypalFill className='h-6 w-6' /></button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
