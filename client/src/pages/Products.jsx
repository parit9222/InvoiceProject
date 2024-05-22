import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Products() {

  const [formData, setFormData] = useState({
    productsName: '',
    qty: '',
    rate: '',
    productStatus: '',
  });
  console.log(formData);


  const navigate = useNavigate();

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);




  const handleFetchData = (e) => {

    if (e.target.id === 'productsName' || e.target.id === 'qty' || e.target.id === 'rate') {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }

    if (e.target.id === 'active' || e.target.id === 'notactive') {
      setFormData({
        ...formData,
        productStatus: e.target.id,
      })
    }

  }



  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/product/prod', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const ProductData = await res.json();

      if (ProductData) {
        setSuccessDialogOpen(true);
      }
    } catch (error) {
      console.log(error.message);
    }
  };





  const successpop = () => {
    setSuccessDialogOpen(false);
    navigate('/productDetails');
  }

  const prevent = (e) => {
    e.preventDefault();
  }

  return (
    <div className='p-3 max-w-lg mt-10 mx-auto'>


      <h1 className='text-3xl text-center font-semibold my-2'>Products Details</h1>


      <form onSubmit={prevent}>

        <div className='flex flex-col gap-4 flex-1 mt-5'>
          <Input
            type='text'
            className='p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
            id='productsName'
            onChange={handleFetchData}
            placeholder='Products Name'
          />
        </div>

        <div className='flex gap-4 flex-1 mt-5'>

          <Input
            type='number'
            className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
            id='qty'
            onChange={handleFetchData}
            placeholder='Qty'
          />

          <Input
            type='number'
            className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
            id='rate'
            onChange={handleFetchData}
            placeholder='Rate'
          />

        </div>

        <div className='flex gap-10 mt-6 flex-wrap'>

          <span className='mx-6 text-slate-600'>Product-Status  : </span>

          <div className='flex gap-2'>
            <input
              type="radio"
              value="active"
              className='w-5'
              id='active'
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
              name='accountstatus'
              onChange={handleFetchData}
            />

            <span className='text-slate-600'>Not-Active</span>
          </div>

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
  )
}
