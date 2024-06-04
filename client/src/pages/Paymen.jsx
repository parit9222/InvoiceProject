import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

export default function Paymen() {
    const today = new Date();
    const formattedToday = format(today, 'dd-MM-yyyy');

    const [formData, setFormData] = useState({
        receiptNumber: '',
        customerName: '',
        customerMobileNumber: '',
        receiptDate: formattedToday,
        paidAmount: '',
        invoiceNumber: '',
        paymentype: '',
        totalAmount: '',
        lastPaidAmount: '',
        pendingAmount: '',
        invoices: [],
    });
    console.log(formData);

    const [phno, setPhno] = useState('');
    const [selectedDate, setSelectedDate] = useState(today);
    const [invoices, setInvoices] = useState([]);
    const navigate = useNavigate();
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    const handlePhnoBlur = () => {
        if (phno.length < 10) {
            toast.error("Phone number must be 10 digits");
        }
    };

    const handleNumberChange = (e) => {
        const inputValue = e.target.value;
        if (/^\d{0,10}$/.test(inputValue)) {
            setPhno(inputValue);
        }
    };

    const handleDateChange = (date) => {
        const formattedDate = format(date, 'dd-MM-yyyy');
        setSelectedDate(date);
        setFormData(prevFormData => ({
            ...prevFormData,
            receiptDate: formattedDate,
        }));
    };

    const successpop = () => {
        setSuccessDialogOpen(false);
        navigate('/paymentDetails');
    }

    const prevent = (e) => {
        e.preventDefault();
    }

    const handleFetchPaymentType = (e) => {
        if (e.target.id === 'cash' || e.target.id === 'bank' || e.target.id === 'online') {
            setFormData(prevFormData => ({
                ...prevFormData,
                paymentype: e.target.id,
            }));
        }
    };

    const handleFetchData = (e, index) => {
        const { id, value } = e.target;

        if (id === 'paidAmount') {
            const lastPaidAmount = parseFloat(value) || 0;
            const totalAmount = parseFloat(formData.totalAmount) || 0;
            const pendingAmount = totalAmount - lastPaidAmount;

            setFormData(prevFormData => ({
                ...prevFormData,
                paidAmount: value,
                lastPaidAmount: value,
                pendingAmount: pendingAmount.toFixed(2),
            }));
        } else if (id === 'paymentInvoice') {
            const newInvoices = [...formData.invoices];
            newInvoices[index].paymentInvoice = value;

            const sumPaidAmounts = newInvoices.reduce((sum, invoice) => {
                return sum + (parseFloat(invoice.paymentInvoice) || 0);
            }, 0);

            const totalAmount = parseFloat(formData.totalAmount) || 0;
            const pendingAmount = totalAmount - sumPaidAmounts;

            newInvoices[index].pendingAmount = newInvoices[index].totalAmount - (parseFloat(newInvoices[index].paymentInvoice) || 0);

            setFormData(prevFormData => ({
                ...prevFormData,
                invoices: newInvoices,
                paidAmount: sumPaidAmounts.toFixed(2),
                lastPaidAmount: sumPaidAmounts.toFixed(2),
                pendingAmount: pendingAmount.toFixed(2),
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [id]: value
            }));
        }
    };

    const { id } = useParams();
    useEffect(() => {
        const fetchData = async () => {
            const idsArray = id.split(',');
            try {
                const fetchedData = await Promise.all(idsArray.map(async (singleId) => {
                    const res = await fetch(`/api/user/currentUserInvoice/${singleId}`);
                    const data = await res.json();
                    return data.data;
                }));

                const mergedData = fetchedData.reduce((acc, current) => {
                    acc.customerName = current.customerName;
                    acc.customerMobileNumber = current.customerMobileNumber;
                    acc.invoiceNumber += `${current.invoiceNumber}, `;
                    acc.totalAmount += parseFloat(current.totalAmount);
                    acc.invoices.push({
                        invoiceNumber: current.invoiceNumber,
                        purchaseDate: current.purchaseDate,
                        totalAmount: parseFloat(current.totalAmount),
                        pendingAmount: parseFloat(current.totalAmount), 
                        paymentInvoice: ''
                    });
                    return acc;
                }, {
                    customerName: '',
                    customerMobileNumber: '',
                    invoiceNumber: '',
                    totalAmount: 0,
                    invoices: [] 
                });

                setInvoices(mergedData.invoices);

                setFormData(prevFormData => ({
                    ...prevFormData,
                    ...mergedData,
                    totalAmount: mergedData.totalAmount.toFixed(2),
                    invoiceNumber: mergedData.invoiceNumber.slice(0, -2) 
                }));
            } catch (error) {
                console.log(error, " fetching data error in update");
            }
        };

        fetchData();
    }, [id]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setFormData(prevFormData => ({
            ...prevFormData,
            lastPaidAmount: prevFormData.paidAmount
        }));
        try {
            const res = await fetch('/api/payment/Receipt', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    lastPaidAmount: formData.paidAmount
                }),
            });
            const PaymentData = await res.json();

            if (PaymentData) {
                setSuccessDialogOpen(true);
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    const handleDeleteInvoice = (indexToDelete) => {
        const newInvoices = invoices.filter((_, index) => index !== indexToDelete);
        const newTotalAmount = newInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

        setInvoices(newInvoices);
        setFormData(prevFormData => ({
            ...prevFormData,
            totalAmount: newTotalAmount.toFixed(2),
            pendingAmount: (newTotalAmount - parseFloat(prevFormData.lastPaidAmount)).toFixed(2),
        }));
    };

    return (
        <div className='p-3 max-w-xl mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-2'>Payment</h1>

            <form onSubmit={prevent}>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' onChange={handleFetchData} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='receiptNumber' placeholder='Receipt Number' />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' onChange={handleFetchData} value={formData.customerName} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='customerName' placeholder='Customer Name' />
                </div>

                <div className='flex gap-16 flex-1 mt-5'>
                    <Input
                        type="tel"
                        value={phno || formData.customerMobileNumber}
                        maxLength={10}
                        onChange={(e) => {
                            handleNumberChange(e);
                            handleFetchData(e);
                        }}
                        onBlur={handlePhnoBlur}
                        pattern="[0-9]*"
                        placeholder='Mobile Number'
                        className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id="customerMobileNumber"
                    />
                    <DatePicker
                        placeholderText='Payment Date'
                        selected={selectedDate}
                        value={selectedDate || formData.purchaseDate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        className="p-4 w-60 focus:outline-none focus:border-sky-500 border-b border-gray-400"
                        required
                    />
                </div>

                <Link to={'/'}>
                    <div className='flex flex-col gap-4 flex-1 mt-5'>
                        <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add Invoices . . . </button>
                    </div>
                </Link>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' onChange={handleFetchData} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' value={formData.paidAmount || ''} id='paidAmount' placeholder='Paid Amount' />
                </div>

                <div className='flex gap-10 mt-6 flex-wrap'>
                    <span className='mx-6 text-slate-600'>Payment Type  : </span>
                    <div className='flex gap-2'>
                        <input
                            type="radio"
                            value="cash"
                            className='w-5'
                            id='cash'
                            onChange={handleFetchPaymentType}
                            name='accountstatus'
                        />
                        <span className='text-slate-600'>Cash</span>
                    </div>
                    <div className='flex gap-2'>
                        <input
                            type="radio"
                            value="bank"
                            className='w-5'
                            id='bank'
                            onChange={handleFetchPaymentType}
                            name='accountstatus'
                        />
                        <span className='text-slate-600'>Bank</span>
                    </div>
                    <div className='flex gap-2'>
                        <input
                            type="radio"
                            value="online"
                            className='w-5'
                            id='online'
                            onChange={handleFetchPaymentType}
                            name='accountstatus'
                        />
                        <span className='text-slate-600'>Online</span>
                    </div>
                </div>

                <div className="container mx-auto">
                    <table className="mt-5">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Invoice Number</th>
                                <th className="border px-4 py-2">Purchase Date</th>
                                <th className="border px-4 py-2">Amount</th>
                                <th className="border px-4 py-2">Pending Amount</th>
                                <th className="border px-4 py-2">Pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2 text-center">{invoice.invoiceNumber}</td>
                                    <td className="border px-4 py-2 text-center">{invoice.purchaseDate}</td>
                                    <td className="border px-4 py-2 text-center">{invoice.totalAmount}</td>
                                    <td className="border px-4 py-2 text-center">{invoice.pendingAmount}</td>
                                    <td className="border w-80 px-4 py-2 text-center">
                                        <Input
                                            type='text'
                                            className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                                            id='paymentInvoice'
                                            placeholder='Pay'
                                            value={invoice.paymentInvoice || ''}
                                            onChange={(e) => handleFetchData(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="text-red-600 font-semibold uppercase hover:opacity-95 rounded-3xl px-2 py-2"
                                            onClick={() => handleDeleteInvoice(index)}
                                        >
                                            Del
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="container mx-auto">
                    <table className="table-auto max-w-lg mx-auto mt-5">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Total Amount</th>
                                <th className="border px-4 py-2">Last Paid Amount</th>
                                <th className="border px-4 py-2">Pending Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2 text-center">{formData.totalAmount}</td>
                                <td className="border px-4 py-2 text-center">{formData.lastPaidAmount}</td>
                                <td className="border px-4 py-2 text-center">{formData.pendingAmount}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <button onClick={handlePaymentSubmit} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Save</button>
                </div>

            </form>

            <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                    <p>Record submitted successfully!</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={successpop}>Close</Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </div>
    )
}
