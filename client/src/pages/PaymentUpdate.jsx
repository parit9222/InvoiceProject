import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import PaymentAddInvoice from './PaymentAddInvoice';
import { MdDelete } from "react-icons/md";
import PaymentPopUp from './PaymentPopUp';



export default function PaymentUpdate() {

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


    const [invoicesArray, setInvoicesArray] = useState();
    console.log(invoicesArray);
    const [invoices, setInvoices] = useState([]);
    const [phno, setPhno] = useState('');
    const [selectedDate, setSelectedDate] = useState(today);
    const navigate = useNavigate();
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);

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
    };

    const prevent = (e) => {
        e.preventDefault();
    };

    const handleFetchPaymentType = (e) => {
        if (e.target.id === 'cash' || e.target.id === 'bank' || e.target.id === 'online') {
            setFormData(prevFormData => ({
                ...prevFormData,
                paymentype: e.target.id,
            }));
        }
    };


    const handleFetchBlurData = (e, index) => {
        const { id, value } = e.target;

        if (id === 'paidAmount') {
            // const lastPaidAmount = parseFloat(value) || 0;
            // const totalAmount = parseFloat(formData.totalAmount) || 0;
            // const pendingAmount = totalAmount - lastPaidAmount;

            setFormData(prevFormData => ({
                ...prevFormData,
                paidAmount: value,
                // lastPaidAmount: value,
                // pendingAmount: pendingAmount.toFixed(2),
            }));
        } else if (id === 'paymentInvoice') {
            const newInvoices = [...formData.invoices];
            newInvoices[index].paymentInvoice = value;

            const sumPaidAmounts = newInvoices.reduce((sum, invoice) => {
                return sum + (parseFloat(invoice.paymentInvoice) || 0);
            }, 0);

            // const totalAmount = parseFloat(formData.totalAmount) || 0;
            // const pendingAmount = totalAmount - sumPaidAmounts;

            // newInvoices[index].pendingAmount = newInvoices[index].totalAmount - (parseFloat(newInvoices[index].paymentInvoice) || 0);

            setFormData(prevFormData => ({
                ...prevFormData,
                invoices: newInvoices,
                paidAmount: sumPaidAmounts.toFixed(2),
                // lastPaidAmount: sumPaidAmounts.toFixed(2),
                // pendingAmount: pendingAmount.toFixed(2),
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [id]: value
            }));
        }
    };


    const handleFetchData = (e, index) => {
        const { id, value } = e.target;
    
        if (id === 'paidAmount') {
            setFormData(prevFormData => ({
                ...prevFormData,
                paidAmount: value,
            }));
        } else if (id === 'paymentInvoice') {
            const newInvoices = [...formData.invoices];
            console.log(newInvoices);
            newInvoices[index].paymentInvoice = value;
    
            const updatedInvoices = newInvoices.map((invoice, i) => {
                if (i === index) {
                    const updatedPendingAmount = parseFloat(invoice.pendingAmount) - (parseFloat(value) || 0);
                    return {
                        ...invoice,
                        pendingAmount: updatedPendingAmount.toFixed(2),
                    };
                }
                return invoice;
            });
    
            const sumPaidAmounts = updatedInvoices.reduce((sum, invoice) => {
                return sum + (parseFloat(invoice.paymentInvoice) || 0);
            }, 0);
    
            setFormData(prevFormData => ({
                ...prevFormData,
                invoices: updatedInvoices,
                paidAmount: sumPaidAmounts.toFixed(2),
                lastPaidAmount: sumPaidAmounts.toFixed(2),
                pendingAmount: updatedInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.pendingAmount), 0).toFixed(2),
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [id]: value,
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
                        paidAmount: user.paidAmount,
                        invoiceNumber: user.invoiceNumber,
                        paymentype: user.paymentype,
                        totalAmount: user.totalAmount,
                        lastPaidAmount: user.lastPaidAmount,
                        pendingAmount: user.pendingAmount,
                        invoices: user.invoices || [],
                    });
                    // setInvoicesArray(user.invoices)
                }
            } catch (error) {
                console.log(error, "fetching data error in update");
            }
        };

        fetchData();
    }, [id]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        for (const invoice of formData.invoices) {
            if (parseFloat(invoice.paymentInvoice) > parseFloat(invoice.totalAmount)) {
                toast.error(`Payment amount for invoice ${invoice.invoiceNumber} exceeds pending amount.`);
                return;
            }
        }
        if (parseFloat(formData.paidAmount) > parseFloat(formData.totalAmount)) {
            toast.error("Paid amount cannot be greater than the total amount.");
            return;
        }

        setFormData(prevFormData => ({
            ...prevFormData,
            lastPaidAmount: prevFormData.paidAmount
        }));
        try {
            const res = await fetch(`/api/payment/paymentUpdate/${id}`, {
                method: "PUT",
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
    };

    // const handlePaymentSubmit = async (e) => {
    //     e.preventDefault();

    //     const filledInvoices = formData.invoices.filter(invoice => invoice.paymentInvoice && invoice.paymentInvoice !== "");
    //     // const dataDemo = formData.invoices.find(item => item.invoiceNumber === )

    //     for (const invoice of filledInvoices) {
    //         if (parseFloat(invoice.paymentInvoice) > parseFloat(invoice.pendingAmount)) {
    //             toast.error(`Payment for invoice ${invoice.invoiceNumber} exceeds pending amount.`);
    //             return;
    //         }
    //     } 

    //     const sumPaidAmounts = filledInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.paymentInvoice) || 0), 0);
    //     const totalAmount = filledInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.totalAmount) || 0), 0);
    //     const pending = filledInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.pendingAmount) || 0), 0);
    //     const pendingAmount = pending - sumPaidAmounts;

    //     try {
    //         const updatedInvoices = filledInvoices.map(invoice => {
    //             const pendingAmount = invoice.pendingAmount - invoice.paymentInvoice;
    //             return {
    //                 ...invoice,
    //                 pendingAmount: pendingAmount,
    //             };
    //         });

    //         const updatedFormData = {
    //             ...formData,
    //             lastPaidAmount: sumPaidAmounts.toFixed(2),
    //             pendingAmount: pendingAmount.toFixed(2),
    //             totalAmount: totalAmount.toFixed(2),
    //             invoices: updatedInvoices,
    //         };

    //         console.log(updatedFormData);

    //         const res = await fetch(`/api/payment/paymentUpdate/${id}`, {
    //             method: "PUT",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(updatedFormData),
    //         });

    //         const data = await res.json();
    //         if (data) {
    //             setSuccessDialogOpen(true);
    //         } else {
    //             console.log(data.message);
    //         }
    //     } catch (error) {
    //         console.error(error.message);
    //     }
    // };

    const handleDeleteInvoice = (indexToDelete) => {
        const newInvoices = formData.invoices.filter((_, index) => index !== indexToDelete);

        const newTotalAmount = newInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount), 0);
        const newSumPaidAmounts = newInvoices.reduce((sum, invoice) => {
            return sum + (parseFloat(invoice.paymentInvoice) || 0);
        }, 0);
        const newPendingAmount = newTotalAmount - newSumPaidAmounts;

        setFormData(prevFormData => ({
            ...prevFormData,
            totalAmount: newTotalAmount.toFixed(2),
            paidAmount: newSumPaidAmounts.toFixed(2),
            lastPaidAmount: newSumPaidAmounts.toFixed(2),
            pendingAmount: newPendingAmount.toFixed(2),
            invoices: newInvoices,
        }));
        setInvoices(newInvoices);
    };

    const handleAddInvoices = () => {
        setInvoiceDialogOpen(true);
    };

    const handleInvoiceSelect = (selectedInvoices, totalAmount) => {
        const selectedInvoiceNumbers = selectedInvoices.map(invoice => invoice.invoiceNumber).join(", ");
        const updatedInvoices = selectedInvoices.map(invoice => ({
            ...invoice,
            pendingAmount: invoice.totalAmount,
            paymentInvoice: ""
        }));
        const newTotalAmount = updatedInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount), 0);

        const mergedInvoices = [...formData.invoices, ...updatedInvoices];

        setFormData(prevFormData => ({
            ...prevFormData,
            invoiceNumber: selectedInvoiceNumbers,
            invoices: mergedInvoices,
            totalAmount: newTotalAmount.toFixed(2),
            paidAmount: "0.00",
            lastPaidAmount: "0.00",
            pendingAmount: mergedInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.pendingAmount), 0).toFixed(2),
        }));
    };

    const handleAddOldInvoices = () => {
        setShowPopUp(true);
    };

    const handleOldInvoiceSelect = (selectedInvoices, totalAmount) => {
        console.log(selectedInvoices);
        console.log(totalAmount);
        const updatedSelectedInvoices = selectedInvoices.map(invoice => ({
            ...invoice,
            paymentInvoice: ""
        }));
        setFormData(prevFormData => ({
            ...prevFormData,
            invoiceNumber: [...prevFormData.invoices.map(invoice => invoice.invoiceNumber), ...updatedSelectedInvoices.map(invoice => invoice.invoiceNumber)].join(", "),
            invoices: [...prevFormData.invoices, ...updatedSelectedInvoices],
        }));
    };

    // const handleOldInvoiceSelect = (selectedInvoices, totalAmount) => {
    //     const updatedSelectedInvoices = selectedInvoices.map(invoice => ({
    //         ...invoice,
    //         paymentInvoice: "",
    //         pendingAmount: parseFloat(invoice.totalAmount) - (parseFloat(invoice.paymentInvoice) || 0)
    //     }));

    //     const mergedInvoices = [...formData.invoices, ...updatedSelectedInvoices];
    //     console.log(mergedInvoices);

    //     setFormData(prevFormData => ({
    //         ...prevFormData,
    //         invoiceNumber: mergedInvoices.map(invoice => invoice.invoiceNumber).join(", "),
    //         invoices: mergedInvoices,
    //         totalAmount: mergedInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount), 0).toFixed(2),
    //         paidAmount: mergedInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.paymentInvoice) || 0), 0).toFixed(2),
    //         lastPaidAmount: mergedInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.paymentInvoice) || 0), 0).toFixed(2),
    //         pendingAmount: mergedInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.pendingAmount), 0).toFixed(2),
    //     }));
    //     setInvoicesArray(mergedInvoices);
    //     setShowPopUp(false);
    // };


    return (
        <div className='p-3 max-w-xl mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-2'>Payment</h1>

            <form onSubmit={prevent}>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' value={formData.receiptNumber} onChange={handleFetchData} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='receiptNumber' placeholder='Receipt Number' />
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

                {/* <Link to={`/addNewInvoice/${formData.customerName}/${formData.invoiceNumber}`}>
                    <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add Invoices . . . </button>
                    </div>
                </Link> */}

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <button onClick={handleAddInvoices} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add New Invoices . . . </button>
                </div>
                <PaymentAddInvoice
                    open={invoiceDialogOpen}
                    onClose={() => setInvoiceDialogOpen(false)}
                    customerName={formData.customerName}
                    invoiceNumber={formData.invoiceNumber}
                    onSelectInvoices={handleInvoiceSelect}
                />

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
                            checked={formData.paymentype === 'cash'}
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
                            checked={formData.paymentype === 'bank'}
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
                            checked={formData.paymentype === 'online'}
                            onChange={handleFetchPaymentType}
                            name='accountstatus'
                        />
                        <span className='text-slate-600'>Online</span>
                    </div>
                </div>

                <button type="button" className='p-3 mt-4 bg-slate-700  text-white rounded-lg uppercase hover:opacity-95' onClick={handleAddOldInvoices}>Add Old Invoices</button>


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
                            {formData.invoices.map((invoice, index) => {
                                console.log(formData.invoices);
                                return (
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
                                                value={invoice.paymentInvoice}
                                                onBlur={(e) => handleFetchData(e, index)} 
                                                onChange={(e) => {
                                                    handleFetchBlurData(e, index); 
                                                }}
                                            />

                                        </td>
                                        <td>
                                            <button
                                                className="text-red-600 font-semibold uppercase hover:opacity-95 rounded-3xl px-2 py-2"
                                                onClick={() => handleDeleteInvoice(index)}
                                            >
                                                <MdDelete className='h-6 w-6' />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
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
            <PaymentPopUp
                open={showPopUp}
                onClose={() => setShowPopUp(false)}
                existingInvoices={formData.invoices}
                onSelectInvoices={handleOldInvoiceSelect}
            />

            <ToastContainer />
        </div>
    )
}
