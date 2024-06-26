import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <div>
            <header className='bg-slate-200 shadow-md'>
                <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
                    <ul className='flex gap-4'>
                        <Link to='/'>
                            <li className='hidden sm:inline text-slate-700 hover:underline'>Invoices</li>
                        </Link>

                        <Link to='/productDetails'>
                            <li className='hidden sm:inline text-slate-700 hover:underline'>Products</li>
                        </Link>

                        <Link to='/customerDetails'>
                            <li className='hidden sm:inline text-slate-700 hover:underline'>Customer</li>
                        </Link>

                        <Link to='/paymentDetails'>
                            <li className='hidden sm:inline text-slate-700 hover:underline'>Payment</li>
                        </Link>

                        <Link to='/report'>
                            <li className='hidden sm:inline text-slate-700 hover:underline'>Payments Report</li>
                        </Link>

                        <Link to='/stockDetails'>
                            <li className='hidden sm:inline text-slate-700 hover:underline'>Stock</li>
                        </Link>
                        
                        <Link to={'/stockReport'}>
                            <li className='hidden sm:inline text-slate-700 hover:underline'>Stocks Report</li>
                        </Link>

                    </ul>
                </div>
            </header>
        </div>
    )
}
