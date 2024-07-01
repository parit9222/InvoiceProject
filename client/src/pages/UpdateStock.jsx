import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

export default function UpdateStock() {
    const today = new Date();
    const formattedToday = format(today, 'dd-MM-yyyy');

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        productsName: '',
        qty: '',
        newStockDate: formattedToday,
        rate: '',
        stockAmount: '',
    });
    const [oldQty, setOldQty] = useState();
    const [users, setUsers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);

    const navigate = useNavigate();

    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

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
        fetchUsers();
    }, []);

    const handleDateChange = (date) => {
        const formattedDate = format(date, 'dd-MM-yyyy');
        setSelectedDate(date);
        setFormData(prevFormData => ({
            ...prevFormData,
            newStockDate: formattedDate,
        }));
    };

    const handleFetchData = (e) => {
        const { id, value } = e.target;
        setFormData(prevFormData => {
            const updatedFormData = {
                ...prevFormData,
                [id]: value,
            };

            if (id === 'qty' || id === 'rate') {
                const qty = parseFloat(updatedFormData.qty) || 0;
                const rate = parseFloat(updatedFormData.rate) || 0;
                updatedFormData.stockAmount = (qty * rate).toFixed(2);
            }

            return updatedFormData;
        });
    };

    const handleAutocompleteChange = (event, value) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            productsName: value,
        }));
    };

    const { id } = useParams();
    useEffect(() => {
        const fetchData = async () => {
          try {
            const res = await fetch(`/api/stock/currentUserStock/${id}`);
            const data = await res.json();
            if (data) {
              const user = data.data;
              setFormData({
                invoiceNumber: user.invoiceNumber,
                productsName: user.productsName,
                qty: user.qty,
                newStockDate: user.newStockDate,
                rate: user.rate,
                stockAmount: user.stockAmount,
            });
            setOldQty(user.qty);
            }
          } catch (error) {
            console.log(error, " fetching data error in update");
          }
        };
    
        fetchData();
      }, [id]);

    // const handleProductSubmit = async (e) => {
    //     e.preventDefault();

    //     try {
    //         const res = await fetch(`/api/stock//update/${id}`, {
    //             method: "PUT",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(formData),
    //         });
    //         const StockData = await res.json();

    //         if (StockData) {
    //             setSuccessDialogOpen(true);
    //         }
    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // };

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        try {
            const selectedProduct = users.find(user => user.productsName === formData.productsName);
            if (selectedProduct) {
                const updatedQty = parseFloat(selectedProduct.qty) - parseFloat(oldQty) + parseFloat(formData.qty);

                const updateRes = await fetch(`/api/product/update/${selectedProduct._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ qty: updatedQty }),
                });

                if (!updateRes.ok) {
                    throw new Error('Failed to update product quantity');
                }

                const stockRes = await fetch(`/api/stock/update/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
                const StockData = await stockRes.json();

                if (StockData) {
                    setSuccessDialogOpen(true);
                }
            } else {
                throw new Error('Selected product not found');
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const successpop = () => {
        setSuccessDialogOpen(false);
        navigate('/stockDetails');
    }

    const prevent = (e) => {
        e.preventDefault();
    }

    return (
        <div className='p-3 max-w-lg mt-10 mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-2'>Stock Details</h1>

            <form onSubmit={prevent}>

            <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input
                        type='number'
                        className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id='invoiceNumber'
                        onChange={handleFetchData}
                        value={formData.invoiceNumber}
                        placeholder='Invoice Number'
                    />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Autocomplete
                        options={users.map(user => user.productsName)}
                        onInputChange={handleAutocompleteChange}
                        value={formData.productsName}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Products Name"
                                variant="outlined"
                                id='productsName'
                                />
                            )}
                    />
                </div>

                <div className='flex gap-4 flex-1 mt-5'>
                    <Input
                        type='number'
                        className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id='qty'
                        value={formData.qty}
                        onChange={handleFetchData}
                        placeholder='Qty'
                    />

                    <DatePicker
                        placeholderText='Payment Date'
                        selected={selectedDate}
                        value={selectedDate || formData.newStockDate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        className="p-4 w-60 focus:outline-none focus:border-sky-500 border-b border-gray-400"
                        required
                    />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input
                        type='number'
                        className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id='rate'
                        value={formData.rate}
                        onChange={handleFetchData}
                        placeholder='Rate'
                    />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input
                        type='number'
                        className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id='stockAmount'
                        value={formData.stockAmount}
                        placeholder='Stock Amount'
                        readOnly
                    />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-10'>
                    <button type='submit' onClick={handleProductSubmit} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Submit</button>
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
        </div>
    );
}
