import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

export default function Payment() {

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
    // const handleFetchData = (e) => {
    //     setFormData(prevFormData => ({
    //         ...prevFormData,
    //         [e.target.id]: e.target.value
    //     }));
    // }

    const handleFetchData = (e) => {
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
            try {
                const res = await fetch(`/api/user/currentUserInvoice/${id}`);
                const data = await res.json();

                if (data) {
                    const user = data.data;

                    setFormData(prevFormData => {
                        const updatedFormData = {
                            ...prevFormData,
                            customerName: user.customerName,
                            customerMobileNumber: user.customerMobileNumber,
                            invoiceNumber: user.invoiceNumber,
                            totalAmount: user.totalAmount,
                        };
                        return updatedFormData;
                    });
                }
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

    return (
        <div className='p-3 max-w-lg mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-2'>Payment</h1>

            <form onSubmit={prevent}>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' onChange={handleFetchData} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='receiptNumber' placeholder='Receipt Number' />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' onChange={handleFetchData} value={formData.customerName} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='customerName' placeholder='Customer Name' />
                </div>

                <div className='flex gap-4 flex-1 mt-5'>
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

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' onChange={handleFetchData} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='paidAmount' placeholder='Paid Amount' />
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
                    <table className="table-auto max-w-lg mx-auto mt-5">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Invoice Number</th>
                                <th className="border px-4 py-2">Total Amount</th>
                                <th className="border px-4 py-2">Last Paid Amount</th>
                                <th className="border px-4 py-2">Pending Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2 text-center">{formData.invoiceNumber}</td>
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
