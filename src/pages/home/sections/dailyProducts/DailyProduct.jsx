import React from 'react';
import './DailyProduct.css';
import DailyBestSeller from './DailySellerSldier';

const DailyProduct = () => {

  return (
    <div className='py-2 md:py-7 mx-3'>
     <h2 className='font-bold font-quicksand text-[26px] -tracking-tight leading-[24px] md:leading-[40px] text-[#253D4E] lg:mt-0 mt-5  md:mb-10 lg:text-left text-center'>
      Daily  Best Sell
     </h2>
      <div className="block lg:flex gap-5 mt-5">
        <div className="hidden lg:block">
          <img className='h-full content-normal' src="https://i.ibb.co.com/9ZrhyB8/White-Minimal-Summer-Sale-Discount-Clothes-Instagram-Story-291-x-402-px-1.png" alt="" />
        </div>

        {/* <DailyBestSeller/> */}
      </div>
    </div>
  )
}

export default DailyProduct