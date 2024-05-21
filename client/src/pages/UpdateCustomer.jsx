import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';


export default function UpdateCustomer() {

    const [formData, setFormData] = useState({
        customerName: '',
        customerMobileNumber: '',
        gstNumber: '',
        accountStatus: '',
    });

    const [phno, setPhno] = useState('');

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


    const handleFetchData = (e) => {

        if (e.target.id === 'customerName' || e.target.id === 'customerMobileNumber' || e.target.id === 'gstNumber') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.value,
            });
        }

        if (e.target.id === 'active' || e.target.id === 'notactive') {
            setFormData({
                ...formData,
                accountStatus: e.target.id,
            })
        }

    }


    const { id } = useParams();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/customer/currentUserCustomer/${id}`);
                const data = await res.json();
                if (data) {
                    const user = data.data;
                    setFormData({
                        customerName: user.customerName,
                        customerMobileNumber: user.customerMobileNumber,
                        gstNumber: user.gstNumber,
                        accountStatus: user.accountStatus,
                    });
                }
            } catch (error) {
                console.log(error, " fetching data error in update");
            }
        };

        fetchData();
    }, [id]);

    const handleCustomerUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/customer/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData }),
            });
            const data = await res.json();
            if (data) {
                setSuccessDialogOpen(true);
                return;
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.error(error.message);
        }
    };



    const successpop = () => {
        setSuccessDialogOpen(false);
        navigate('/customerDetails');
    }

    const prevent = (e) => {
        e.preventDefault();
    }

    return (
        <div className='p-3 max-w-lg mt-10 mx-auto'>


            <h1 className='text-3xl text-center font-semibold my-2'>Customer Details</h1>


            <form onSubmit={prevent}>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input
                        type='text'
                        className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id='customerName'
                        onChange={handleFetchData}
                        placeholder='Customer Name'
                        value={formData.customerName}
                    />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
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
                        className=' p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id="customerMobileNumber"
                    />
                </div>

                <div className='flex flex-col gap-4 flex-1 mt-5'>
                    <Input
                        type="text"
                        placeholder="GST Number"
                        className=' p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        id="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleFetchData}
                    />
                </div>


                <div className='flex gap-10 mt-6 flex-wrap'>

                    <span className='mx-6 text-slate-600'>Account-Status  : </span>

                    <div className='flex gap-2'>
                        <input
                            type="radio"
                            value="active"
                            className='w-5'
                            id='active'
                            checked={formData.accountStatus === 'active'}
                            name='accountstatus'
                            onChange={handleFetchData}
                        />

                        <span className='text-slate-600'>Active</span>
                    </div>

                    <div className='flex gap-2'>
                        <input
                            type="radio"
                            value="notactive"
                            className='w-5'
                            id='notactive'
                            checked={formData.accountStatus === 'notactive'}
                            name='accountstatus'
                            onChange={handleFetchData}
                        />

                        <span className='text-slate-600'>Not-Active</span>
                    </div>

                </div>

                <div className='flex flex-col gap-4 flex-1 mt-10'>
                    <button type='submit' onClick={handleCustomerUpdate} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Submit</button>
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