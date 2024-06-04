import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

export default function UpdatePayment() {
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
        setFormData(prevData => ({
            ...prevData,
            receiptDate: formattedDate,
        }));
    };

    const handleFetchData = (e, index) => {
        const { id, value } = e.target;

        if (id === 'paidAmount') { 
            setFormData(prevFormData => ({
                ...prevFormData,
                paidAmount: value,
                lastPaidAmount: value,
            }));
        } else if (id === 'paymentInvoice') {
            const newInvoices = [...formData.invoices];
            newInvoices[index].paymentInvoice = value;

            const sumPaidAmounts = newInvoices.reduce((sum, invoice) => {
                return sum + (parseFloat(invoice.paymentInvoice) || 0);
            }, 0);

            setFormData(prevFormData => ({
                ...prevFormData,
                invoices: newInvoices,
                paidAmount: sumPaidAmounts.toFixed(2),
                lastPaidAmount: sumPaidAmounts.toFixed(2),
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [id]: value
            }));
        }
    };

    const handleFetchPaymentType = (e) => {
        if (e.target.id === 'cash' || e.target.id === 'bank' || e.target.id === 'online') {
            setFormData(prevData => ({
                ...prevData,
                paymentype: e.target.id,
            }));
        }
    };

    const { id } = useParams();
    useEffect(() => {
        const fetchData = async () => {
            try {   
                const res = await fetch(`/api/payment/currentUserReceipt/${id}`);
                const data = await res.json();
                if (data) {
                    const user = data.data;
                    setFormData({
                        receiptNumber: user.receiptNumber,
                        customerName: user.customerName,
                        customerMobileNumber: user.customerMobileNumber,
                        receiptDate: user.receiptDate,
                        paidAmount: '',
                        invoiceNumber: user.invoiceNumber,
                        paymentType: user.paymentType,
                        totalAmount: user.totalAmount,
                        lastPaidAmount: user.lastPaidAmount,
                        pendingAmount: user.pendingAmount,
                        invoices: user.invoices || [],
                    });
                }
            } catch (error) {
                console.log(error, "fetching data error in update");
            }
        };

        fetchData();
    }, [id]);

    const handlePaymentUpdate = async (e) => {
        e.preventDefault();
        
        
        for (const invoice of formData.invoices) {
            if (parseFloat(invoice.paymentInvoice) > parseFloat(invoice.pendingAmount)) {
                toast.error(`Payment for invoice ${invoice.invoiceNumber} exceeds pending amount.`);
                return;
            }
        }
        if (parseFloat(formData.paidAmount) > parseFloat(formData.totalAmount)) {
            toast.error("Paid amount cannot be greater than the total amount.");
            return;
        }

        try {
            const updatedInvoices = formData.invoices.map(invoice => {
                const pendingAmount = invoice.pendingAmount - invoice.paymentInvoice;
                return {
                    ...invoice,
                    pendingAmount: pendingAmount
                };
            });
            
            const updatedFormData = {
                ...formData,
                lastPaidAmount: formData.paidAmount,
                pendingAmount: formData.pendingAmount - formData.paidAmount,
                invoices: updatedInvoices 
            };
    
            console.log(updatedFormData);
    
            const res = await fetch(`/api/payment/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedFormData),
            });
    
            const data = await res.json();
            if (data) {
                setSuccessDialogOpen(true);
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const successpop = () => {
        setSuccessDialogOpen(false);
        navigate('/paymentDetails');
    };

    const prevent = (e) => {
        e.preventDefault();
    };

    return (
        <div className='p-3 max-w-xl mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-2'>Payment</h1>

            <form onSubmit={prevent}>
                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' onChange={handleFetchData} value={formData.receiptNumber} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='receiptNumber' placeholder='Receipt Number' />
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
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        className="p-4 w-60 focus:outline-none focus:border-sky-500 border-b border-gray-400"
                        required
                    />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' onChange={handleFetchData} value={formData.paidAmount} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='paidAmount' placeholder='Paid Amount' />
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
                            {formData.invoices.map((invoice, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2 text-center">{invoice.invoiceNumber}</td>
                                    <td className="border px-4 py-2 text-center">{invoice.purchaseDate}</td>
                                    <td className="border font-semibold px-4 py-2 text-center">{invoice.totalAmount}</td>
                                    <td className="border text-red-600 font-semibold px-4 py-2 text-center">{invoice.pendingAmount}</td>
                                    <td className="border w-80 px-4 py-2 text-center">
                                        <Input
                                            type='text'
                                            className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                                            id='paymentInvoice'
                                            placeholder='Pay'
                                            onChange={(e) => handleFetchData(e, index)}
                                        />
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
                                <td className="border font-semibold px-4 py-2 text-center">{formData.totalAmount}</td>
                                <td className="border text-green-600 font-semibold px-4 py-2 text-center">{formData.lastPaidAmount}</td>
                                <td className="border text-red-600 font-semibold px-4 py-2 text-center">{formData.pendingAmount}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <button onClick={handlePaymentUpdate} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Save</button>
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
    );
}
