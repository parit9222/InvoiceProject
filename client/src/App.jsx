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
import Payment from './pages/Payment.jsx';
import PaymentDetails from './pages/PaymentDetails.jsx';
import UpdatePayment from './pages/UpdatePayment.jsx';
import PaymentAddInvoice from './pages/PaymentAddInvoice.jsx';
import PaymentUpdate from './pages/PaymentUpdate.jsx';
import Report from './pages/Report.jsx';
import Stock from './pages/Stock.jsx';
import StockDetails from './pages/StockDetails.jsx';
import UpdateStock from './pages/UpdateStock.jsx';
import DetailStock from './pages/DetailStock.jsx';
import StockReport from './pages/StockReport.jsx';
import GeneratePdf from './pages/GeneratePdf.jsx';

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

        <Route path="/payment/:id" element={<Payment />} />
        <Route path="/paymentDetails" element={<PaymentDetails />} />
        <Route path="/updatePayment/:id" element={<UpdatePayment />} />
        <Route path="/paymentUpdate/:id" element={<PaymentUpdate />} />
        <Route path="/addNewInvoice/:customerName/:invoiceNumber" element={<PaymentAddInvoice />} />

        <Route path="/report" element={<Report />} />

        <Route path="/stock" element={<Stock />} />
        <Route path="/stockDetails" element={<StockDetails />} />
        <Route path="/updateStock/:id" element={<UpdateStock />} />
        <Route path="/detailStock" element={<DetailStock />} />
        <Route path="/stockReport" element={<StockReport />} />
        
        <Route path="/generate-pdf" element={<GeneratePdf />} />

      </Routes>
    </BrowserRouter>
  )
}
