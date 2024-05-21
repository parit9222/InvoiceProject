import React, { useEffect, useState } from 'react';
import Input from '@mui/material/Input';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export default function UpdateProduct() {

  const [formData, setFormData] = useState({
    productsName: '',
    qty: '',
    rate: '',
  });


  const navigate = useNavigate();

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);




  const handleFetchData = (e) => {

    if (e.target.id === 'productsName' || e.target.id === 'qty' || e.target.id === 'rate') {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }

  }



  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/product/currentUserProduct/${id}`);
        const data = await res.json();
        if (data) {
          const user = data.data;
          setFormData({
            productsName: user.productsName,
            qty: user.qty,
            rate: user.rate,
          });
        }
      } catch (error) {
        console.log(error, " fetching data error in update");
      }
    };

    fetchData();
  }, [id]);

  const handleProductUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/product/update/${id}`, {
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
            value={formData.productsName}
            onChange={handleFetchData}
            placeholder='Products Name'
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

          <Input
            type='number'
            className='w-60 p-3 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
            id='rate'
            value={formData.rate}
            onChange={handleFetchData}
            placeholder='Rate'
          />

        </div>

        <div className='flex flex-col gap-4 flex-1 mt-10'>
          <button type='submit' onClick={handleProductUpdate} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>Submit</button>
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
