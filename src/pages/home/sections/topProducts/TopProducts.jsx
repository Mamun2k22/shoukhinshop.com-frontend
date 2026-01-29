import React from 'react'

const TopProducts = () => {
  return (
     <div className="top-product-section px-5 md:px-11 py-3 md:py-8">
      <div className="top-product-items grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="top-product-item">
          <h3 className='text-[20px] md:text-[26px] mb-3 md:mb-7 pb-2 md:pb-5 font-semibold relative before:bottom-0 before:left-0 before:z-10 before:absolute before:h-[3px] before:bg-[#b0e5c2] before:w-[20%] after:absolute after:bg-[#f0f0f0] after:left-0 after:bottom-0 after:w-full after:h-[3px]'>
            Top Selling
          </h3>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <a className='w-full' href=""><img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" /></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" />
              <a href=""></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <a className='w-full' href=""><img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" /></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
        </div>
        <div className="top-product-item">
          <h3 className='text-[20px] md:text-[26px] mb-3 md:mb-7 pb-2 md:pb-5 font-semibold relative before:bottom-0 before:left-0 before:z-10 before:absolute before:h-[3px] before:bg-[#b0e5c2] before:w-[20%] after:absolute after:bg-[#f0f0f0] after:left-0 after:bottom-0 after:w-full after:h-[3px]'>
            Top Selling
          </h3>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <a className='w-full' href=""><img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" /></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" />
              <a href=""></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <a className='w-full' href=""><img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" /></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
        </div>
        <div className="top-product-item">
          <h3 className='text-[20px] md:text-[26px] mb-3 md:mb-7 pb-2 md:pb-5 font-semibold relative before:bottom-0 before:left-0 before:z-10 before:absolute before:h-[3px] before:bg-[#b0e5c2] before:w-[20%] after:absolute after:bg-[#f0f0f0] after:left-0 after:bottom-0 after:w-full after:h-[3px]'>
            Top Selling
          </h3>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <a className='w-full' href=""><img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" /></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" />
              <a href=""></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <a className='w-full' href=""><img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" /></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
        </div>
        <div className="top-product-item">
          <h3 className='text-[20px] md:text-[26px] mb-3 md:mb-7 pb-2 md:pb-5 font-semibold relative before:bottom-0 before:left-0 before:z-10 before:absolute before:h-[3px] before:bg-[#b0e5c2] before:w-[20%] after:absolute after:bg-[#f0f0f0] after:left-0 after:bottom-0 after:w-full after:h-[3px]'>
            Top Selling
          </h3>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <a className='w-full' href=""><img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" /></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" />
              <a href=""></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
          <div className="top-product-item-card transition duration-300 ease-in-out hover:transform hover:translate-y-[-10px] flex py-5 relative items-center">
            <div className="w-[30%]">
              <a className='w-full' href=""><img src="https://ecommerce-website-2k24.netlify.app/static/media/thumbnail-1.030ea6a82a502a527bf2.jpg" alt="" /></a>
            </div>
            <div className="info px-3 w-[70%]">
              <a href="">
              <h4 className='text-[16px] font-bold leading-[20px] mb-[8px]'>Nestle Original Coffee-Mate Coffee Creamer</h4>
              </a>
              <span className='product-rating flex gap-1 mb-2'>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
              <span>
                <svg fill='#FAAF00' className='w-4 h-4' focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
              </span>
            </span>
             <div className="flex items-center">
              <span className='text-[16px] font-semibold mr-3 text-[#22C55E]'>$28.85</span>
              <span className='text[14px] line-through'>$30</span>
             </div>
            </div>
          </div>
        </div>
      
      </div>
     </div>
  )
}

export default TopProducts