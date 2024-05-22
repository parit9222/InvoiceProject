import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

export default function Invoice() {
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        customerName: '',
        customerMobileNumber: '',
        purchaseDate: '',
        items: [],
        totalDiscount: '',
        totalAmount: '',
    });

    const [phno, setPhno] = useState('');
    const [open, setOpen] = useState(false);
    const [data, setData] = useState([]);
    const [popFormData, setpopFormData] = useState({ productname: '', qty: '', rate: '', discountper: '', discountamount: '', amount: '' });
    const [selectedRow, setSelectedRow] = useState(null);
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today);
    const navigate = useNavigate();

    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    const [users, setUsers] = useState([]);
    const [productUsers, setProductUsers] = useState([]);
    const [customerName, setCustomerName] = useState([]);
    const [customerMobileNumber, setCustomerMobileNumber] = useState([]);
    const [showCustomerOptions, setShowCustomerOptions] = useState(false);
    const [inputCustomerValue, setInputCustomerValue] = useState('');



    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/customer/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();

                const activeCustomers = data.data.filter(customer => customer.accountStatus === 'active');
                const activeCustomerNames = activeCustomers.map(customer => customer.customerName);
                const activeCustomerMobileNumbers = activeCustomers.map(customer => customer.customerMobileNumber);

                setUsers(activeCustomers);
                setCustomerName(activeCustomerNames);
                setCustomerMobileNumber(activeCustomerMobileNumbers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);




    const [productName, setProductName] = useState([]);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/product/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
    
                const activeProductNames = data.data
                    .filter(product => product.productStatus === 'active') 
                    .map(product => product.productsName);
    
                setProductName(activeProductNames);
                setProductUsers(data.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);
    










    useEffect(() => {
        const totalDiscount = data.reduce((acc, item) => acc + parseFloat(item.discountamount || 0), 0);
        setFormData(prevState => ({ ...prevState, totalDiscount: totalDiscount.toFixed(2) }));

        const totalAmount = calculateTotalAmount();
        setFormData(prevState => ({ ...prevState, totalAmount: totalAmount.toFixed(2), items: data }));
    }, [data]);

    const handleOpen = (e) => {
        e.preventDefault();
        setOpen(true);
    };

    const handleClose = () => {
        setpopFormData({ productname: '', qty: '', rate: '', discountper: '', discountamount: '', amount: '' });
        setOpen(false);
    };


    const handleInputChange = (e) => {
        const { id, value } = e.target;
        if (id === 'productname') {
            const selectedProduct = productUsers.find(product => product.productsName === value);
            setpopFormData(prevData => ({
                ...prevData,
                [id]: value,
                rate: selectedProduct ? selectedProduct.rate : '', // Set rate based on selected product
            }));
        } else {
            setpopFormData(prevData => {
                const newData = {
                    ...prevData,
                    [id]: value,
                };
                const discountAmount = (newData.rate * newData.qty * newData.discountper) / 100;
                newData.discountamount = discountAmount.toFixed(2);
                newData.amount = (newData.rate * newData.qty) - discountAmount;
                return newData;
            });
        }
    };
    
    
    
    

    const handleDelete = (index) => {
        const newData = [...data];
        newData.splice(index, 1);
        setData(newData);
        setFormData(prevFormData => ({
            ...prevFormData,
            items: newData
        }));
    };

    const calculateTotalAmount = () => {
        return data.reduce((total, item) => total + parseFloat(item.amount || 0), 0);
    };

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

    const handleFetchData = (e) => {
        const { id, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [id]: value
        }));
    };

    const handleDateChange = (date) => {
        const formattedDate = format(date, 'dd-MM-yyyy');
        setSelectedDate(date);
        setFormData(prevFormData => ({
          ...prevFormData,
          purchaseDate: formattedDate,
        }));
      };
      if (formData.purchaseDate === '') {
        const formattedToday = format(today, 'dd-MM-yyyy');
        setFormData(prevFormData => ({
          ...prevFormData,
          purchaseDate: formattedToday,
        }));
      }

    const handleUpdate = (index) => {
        setOpen(true);
        setSelectedRow(index);
        setpopFormData(data[index]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRow !== null) {
            const newData = [...data];
            newData[selectedRow] = popFormData;
            setData(newData);
            setSelectedRow(null);
        } else {
            setData([...data, popFormData]);
        }

        setFormData(prevFormData => ({
            ...prevFormData,
            items: [...data, popFormData],
        }));

        setpopFormData({ productname: '', qty: '', rate: '', discountper: '', discountamount: '', amount: '' });
        handleClose();
    };

    const handleInvoiceSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user/invoice', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const invoiceData = await res.json();

            if (invoiceData) {
                for (const item of formData.items) {
                    const product = productUsers.find(p => p.productsName === item.productname);
                    if (product) {
                        const updatedQty = product.qty - item.qty;
                        if (updatedQty <= 20) {
                            toast.warn(`${product.productsName} quantity is now ${updatedQty}`);
                        }
                        await fetch(`/api/product/update/${product._id}`, {
                            method: "put",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ productId: product._id, qty: updatedQty }),
                        });
                    }
                }
                setSuccessDialogOpen(true);
            }

            // if (invoiceData) {
            //     setSuccessDialogOpen(true);
            // }
        } catch (error) {
            console.log(error.message);
        }
    };

    
    

    const successpop = () => {
        setSuccessDialogOpen(false);
        navigate('/');
    }

    const prevent = (e) => {
        e.preventDefault();
    }

    const handleInputCustomerChange = (e) => {
        setInputCustomerValue(e.target.value);
        if (!showCustomerOptions) setShowCustomerOptions(true);
    };

    const handleOptionClick = (option) => {
        setInputCustomerValue(option);
        setShowCustomerOptions(false);

        const selectedCustomer = users.find(customer => customer.customerName === option);
        if (selectedCustomer) {
            setFormData(prevFormData => ({
                ...prevFormData,
                customerName: option,
                customerMobileNumber: selectedCustomer.customerMobileNumber
            }));
            setPhno(selectedCustomer.customerMobileNumber);
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setShowCustomerOptions(false);
        }, 100);
    };

    const handleInputFocus = () => {
        setShowCustomerOptions(true);
    };

    return (
        <div className='p-3 max-w-lg mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-2'>Invoice</h1>
            <form onSubmit={prevent}>
                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <span className='text-slate-700 text-lg'>Invoice No:</span>
                    <Input type='text' onChange={handleFetchData} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='invoiceNumber' placeholder='Invoice Number' />
                </div>
                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Link to={'/customer'}>
                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add New Customer</button>
                    </Link>
                </div>
                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input
                        type='text'
                        className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id='customerName'
                        value={inputCustomerValue}
                        onChange={(e) => {
                            handleFetchData(e);
                            handleInputCustomerChange(e);
                        }}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder='Customer Name'
                    />
                    {showCustomerOptions && (
                        <ul className='border'>
                            {customerName.map((option, index) => (
                                <li
                                    key={index}
                                    onMouseDown={() => handleOptionClick(option)}
                                    className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                                >
                                    {option}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className='flex gap-4 flex-1 mt-5'>
                    <Input
                        type="tel"
                        value={phno}
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
                        placeholderText='Purchase Date'
                        selected={selectedDate}
                        value={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        className="p-4 w-60 focus:outline-none focus:border-sky-500 border-b border-gray-400"
                        required
                    />
                </div>
                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <button onClick={handleOpen} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Add More Product  . . .</button>
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>Products</DialogTitle>
                        <DialogContent>
                            <div className='flex flex-col gap-4 flex-1 mt-5'>
                                {/* <Input type='text' className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='productname' placeholder='Products Name' onChange={handleInputChange} value={popFormData.productname} /> */}
                                <select id="productname"  onChange={handleInputChange} value={popFormData.productname} className="p-3 focus:outline-none focus:border-sky-500 border-b-2 border-gray-400">
                                    <option selected>Products Name</option>
                                    {productName.map((option, index) => (
                                        <option
                                            key={index}
                                            className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        >
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex gap-4 flex-1 mt-5'>
                                <Input type='number' className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='qty' placeholder='Qty' onChange={handleInputChange} value={popFormData.qty} />
                                <Input type='number' className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='rate' placeholder='Rate' onChange={handleInputChange} value={popFormData.rate} />
                                <Input type='number' className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='discountper' placeholder='Discount  ( % )' onChange={handleInputChange} value={popFormData.discountper} />
                            </div>
                            <div className='flex gap-4 flex-1 mt-5'>
                                <Input type='number' className='w-80 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' readOnly id='discountamount' placeholder='Discount Amount' value={popFormData.discountamount} />
                                <Input type='number' className='w-80 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='amount' readOnly placeholder='Amount' value={popFormData.amount} />
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleSubmit}>Submit</Button>
                            <Button onClick={handleClose}>Cancel</Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div className='flex flex-col gap-4 flex-1 mt-5'>
                </div>
                <div className="container mx-auto">
                    <table className="table-auto max-w-lg mx-auto mt-5">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Product Name</th>
                                <th className="border px-4 py-2">Qty</th>
                                <th className="border px-4 py-2">Rate</th>
                                <th className="border px-4 py-2">Discount %</th>
                                <th className="border px-4 py-2">Discount Amount</th>
                                <th className="border px-4 py-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{item.productname}</td>
                                    <td className="border px-4 py-2">{item.qty}</td>
                                    <td className="border px-4 py-2">{item.rate}</td>
                                    <td className="border px-4 py-2">{item.discountper}</td>
                                    <td className="border px-4 py-2">{item.discountamount}</td>
                                    <td className="border px-4 py-2">{item.amount}</td>
                                    <td>
                                        <button onClick={() => handleUpdate(index)} className="text-green-600 uppercase hover:opacity-95 rounded-3xl px-2 py-2">Update</button>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(index)} className="text-red-600 uppercase hover:opacity-95 rounded-3xl px-2 py-2">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='flex gap-4 flex-1 mt-5'>
                    <Input type='number' className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='totalDiscount' placeholder='Total Discount' value={formData.totalDiscount} readOnly />
                    <Input type='number' className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='totalAmount' placeholder='Total Amount' value={formData.totalAmount} readOnly />
                </div>
                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <button type='submit' onClick={handleInvoiceSubmit} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Submit</button>
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
