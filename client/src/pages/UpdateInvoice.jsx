import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

export default function UpdateInvoice() {

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
    const [popFormData, setpopFormData] = useState({
        productId: '',
        productname: '',
        qty: '',
        rate: '',
        discountper: '',
        discountamount: '',
        amount: ''
    }); const [selectedRow, setSelectedRow] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);


    const navigate = useNavigate();

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



    const [productName, setProductName] = useState([]);
    const [productUsers, setProductUsers] = useState([]);
    console.log(productUsers);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/product/details');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();

                // Filter active products
                const activeProducts = data.data.filter(product => product.productStatus === 'active');

                // Store only active products in productUsers
                setProductUsers(activeProducts);
                setProductName(activeProducts.map(product => product.productsName));
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);



    // const handleInputChange = (e) => {
    //     const { id, value } = e.target;
    //     if (id === 'productname') {
    //         const selectedProduct = productUsers.find(product => product.productsName === value);
    //         setpopFormData(prevData => ({
    //             ...prevData,
    //             [id]: value,
    //             rate: selectedProduct ? selectedProduct.rate : '', 
    //         }));
    //     } else {
    //         setpopFormData(prevData => {
    //             const newData = {
    //                 ...prevData,
    //                 [id]: value,
    //             };
    //             const discountAmount = (newData.rate * newData.qty * newData.discountper) / 100;
    //             newData.discountamount = discountAmount.toFixed(2);
    //             newData.amount = (newData.rate * newData.qty) - discountAmount;
    //             return newData;
    //         });
    //     }
    // };

    const handleInputChange = (e, products) => {
        const { id, value } = e.target;

        if (id === 'productname') {
            const selectedProduct = productUsers.find(product => product._id === value);
            if (selectedProduct) {
                setpopFormData(prevData => ({
                    ...prevData,
                    productId: selectedProduct._id,
                    productname: selectedProduct.productsName,
                    rate: selectedProduct.rate,
                }));
            }
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






    const handleDelete = async (index) => {
        const deletedItem = data[index];
        const product = productUsers.find(p => p._id === deletedItem.productId);
        console.log(product);
        if (product) {
            const updatedQty = (+product.qty) + (+deletedItem.qty);
            try {
                await fetch(`/api/product/update/${product._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ productId: product._id, qty: updatedQty }),
                });

                const newData = [...data];
                newData.splice(index, 1);
                setData(newData);
                setFormData(prevFormData => ({
                    ...prevFormData,
                    items: newData,
                    totalDiscount: newData.reduce((acc, item) => acc + parseFloat(item.discountamount || 0), 0).toFixed(2),
                    totalAmount: calculateTotalAmount(newData).toFixed(2)
                }));

                toast.success('Product deleted and quantity updated successfully!');
            } catch (error) {
                console.error('Error updating product quantity:', error);
            }
        }
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







    const [oldQty, setOldQty] = useState('');
    console.log(oldQty);
    const { id } = useParams();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/user/currentUserInvoice/${id}`);
                const data = await res.json();

                if (data.status === 201) {
                    const user = data.data;
                    const upitems = user.items;
                    const oldProductQty = upitems.map(q => q.qty);
                    console.log(oldProductQty);
                    setOldQty(oldProductQty);
                    setFormData({
                        invoiceNumber: user.invoiceNumber,
                        customerName: user.customerName,
                        customerMobileNumber: user.customerMobileNumber,
                        purchaseDate: user.purchaseDate,
                        items: user.items,
                        totalDiscount: user.totalDiscount,
                        totalAmount: user.totalAmount,
                    });
                    setData(user.items);
                }
            } catch (error) {
                console.log(error, " fetching data error in update");
            }
        };

        fetchData();
    }, [id]);



    // const handleInvoiceUpdate = async (e) => {
    //     e.preventDefault(); 
    //     try {
    //         const res = await fetch(`/api/user/update/${id}`, {
    //             method: "PUT",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ ...formData }),
    //         });
    //         const Updatedata = await res.json();

    //         if (Updatedata) {

    //             for (const item of formData.items) {

    //                 console.log(item);

    //                 const product = productUsers.find(p => p.productsName === item.productname);
    //                     console.log(product);

    //                 if (product) {
    //                     const previousItem = data.find(d => d.productname === item.productname);
    //                         console.log(previousItem);
    //                     const previousItemQty = previousItem ? previousItem.qty : 0;
    //                     // const updatedQty = +product.qty + +previousItemQty - +item.qty;
    //                     const updatedQty = (+product.qty) + (+oldQty) - (+item.qty);
    //                     console.log(updatedQty);
    //                     console.log(+product.qty);
    //                     console.log(+oldQty);
    //                     console.log(+item.qty);

    //                     await fetch(`/api/product/update/${product._id}`, {
    //                         method: "PUT",
    //                         headers: {
    //                             "Content-Type": "application/json",
    //                         },
    //                         body: JSON.stringify({ productId: product._id, qty: updatedQty }),
    //                     });
    //                 }
    //             }
    //             setSuccessDialogOpen(true);
    //         } else {
    //             console.log(data.message);
    //         }
    //     } catch (error) {
    //         console.error(error.message);
    //     }
    // };


    const handleInvoiceUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/user/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData }),
            });
            const Updatedata = await res.json();

            if (Updatedata) {
                for (const [index, item] of formData.items.entries()) {
                    const product = productUsers.find(p => p._id === item.productId);
                    console.log(product);
                    if (product) {
                        // const previousItemQty = oldQty[index];
                        const previousItemQty = oldQty[index] ?? 0;
                        const updatedQty = (+product.qty) + (+previousItemQty) - (+item.qty);
                        if (updatedQty <= 20) {
                            toast.warn(`${product.productsName} quantity is now ${updatedQty}`);
                        }

                        await fetch(`/api/product/update/${product._id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ productId: product._id, qty: updatedQty }),
                        });
                    }
                }
                setSuccessDialogOpen(true);
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.error(error.message);
        }
    };




    // const handleInvoiceUpdate = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const res = await fetch(`/api/user/update/${id}`, {
    //             method: "PUT",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ ...formData }),
    //         });
    //         const data = await res.json();
    //         console.log(data);
    //         if (data) {
    //             for (const item of formData.items) {
    //                 console.log(item);
    //                 const product = productUsers.find(p => p.productsName === item.productname);
    //                 // console.log(p.productsName === item.productname);
    //                 console.log(product);
    //                 if (product) {
    //                     console.log(product);
    //                     const previousItem = data.data.items.find(d => d.productname === item.productname);
    //                     const previousItemQty = previousItem ? previousItem.qty : 0;
    //                     const updatedQty = (+product.qty) + (+previousItemQty) - (+item.qty);
    //                     console.log(updatedQty);
    //                     await fetch(`/api/product/update/${product._id}`, {
    //                         method: "PUT",
    //                         headers: {
    //                             "Content-Type": "application/json",
    //                         },
    //                         body: JSON.stringify({ productId: product._id, qty: updatedQty }),
    //                     });
    //                 }
    //             }
    //             setSuccessDialogOpen(true);
    //         } else {
    //             console.log(data.message);
    //         }
    //     } catch (error) {
    //         console.error(error.message);
    //     }
    // };



    // const handleInvoiceUpdate = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const res = await fetch(`/api/user/update/${id}`, {
    //             method: "PUT",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ ...formData }),
    //         });
    //         const Updatedata = await res.json();
    //         if (Updatedata) {
    //             for (const item of formData.items) {
    //                 const product = productUsers?.find(p => p.productsName === item.productname);
    //                 if (product) {
    //                     const previousItem = data.find(d => d.productname === item.productname);
    //                     const previousItemQty = previousItem ? previousItem.qty : 0;
    //                     const updatedQty = +product.qty + (+oldQty - +item.qty);
    //                     // const updatedQty = +product.qty - +item.qty;

    //                     await fetch(`/api/product/update/${product._id}`, {
    //                         method: "PUT",
    //                         headers: {
    //                             "Content-Type": "application/json",
    //                         },
    //                         body: JSON.stringify({ productId: product._id, qty: updatedQty }),
    //                     });
    //                 }
    //             }
    //             setSuccessDialogOpen(true);
    //         } else {
    //             console.log(data.message);
    //         }
    //     } catch (error) {
    //         console.error(error.message);
    //     }
    // };






    const successpop = () => {
        setSuccessDialogOpen(false);
        navigate('/');
    }


    const prevent = (e) => {
        e.preventDefault();
    }

    return (
        <div className='p-3 max-w-lg mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-2'>Invoice</h1>
            <form onSubmit={prevent}>
                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' value={formData.invoiceNumber} onChange={handleFetchData} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='invoiceNumber' placeholder='Invoice Number' />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input type='text' value={formData.customerName} className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500' id='customerName' onChange={handleFetchData} placeholder='Customer Name' />
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
                        placeholderText='Purchase Date'
                        selected={selectedDate}
                        value={selectedDate || formData.purchaseDate}
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
                                {/* <select id="productname"  onChange={handleInputChange} value={popFormData.productname} className="p-3 focus:outline-none focus:border-sky-500 border-b-2 border-gray-400">
                                    <option selected>Products Name</option>
                                    {productName.map((option, index) => (
                                        <option
                                            key={index}
                                            className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        >
                                            {option}
                                        </option>
                                    ))}
                                </select> */}

                                <select
                                    id="productname"
                                    onChange={(e) => handleInputChange(e, productUsers)}
                                    value={popFormData.productId}
                                    className="p-3 focus:outline-none focus:border-sky-500 border-b-2 border-gray-400"
                                >
                                    <option value="" disabled>Select Product</option>
                                    {productUsers.map((option) => (
                                        <option
                                            key={option._id}
                                            value={option._id}
                                        >
                                            {option.productsName}
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
                    <button type='submit' onClick={handleInvoiceUpdate} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Submit</button>
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
