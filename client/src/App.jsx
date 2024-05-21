import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Invoice from './pages/Invoice.jsx';
import Products from './pages/Products.jsx';
import Customer from './pages/Customer.jsx';
import InvoiceDetails from './pages/InvoiceDetails.jsx';
import UpdateInvoice from './pages/UpdateInvoice.jsx';
import CustomerDetails from './pages/CustomerDetails.jsx';
import UpdateCustomer from './pages/UpdateCustomer.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import UpdateProduct from './pages/UpdateProduct.jsx';

export default function App() {

  return (
    <BrowserRouter>
      <Header />
      <Routes>

        <Route path="/" element={<InvoiceDetails />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/updateInvoice/:id" element={<UpdateInvoice />} />

        <Route path="/customerDetails" element={<CustomerDetails />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/updateCustomer/:id" element={<UpdateCustomer />} />

        <Route path="/productDetails" element={<ProductDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/updateProduct/:id" element={<UpdateProduct />} />

      </Routes>
    </BrowserRouter>
  )
}
