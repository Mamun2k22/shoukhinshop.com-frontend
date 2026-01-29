
import './productBanner.css'

export const ProductBanner = () => {
  return (
    <div className='py-4 md:py-[30px] px-5 md:px-[45px] '>
      <div className="banner-items grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="banner-item  rounded-[15px] overflow-hidden px-[15px cursor-pointer">
        <img className='w-full  transition-all duration-300 ease-in-out object-cover' src="https://i.ibb.co.com/ZBbbpYb/blue-green-modern-Gadget-review-You-Tube-thumbnail-400-x-230-px.png" alt="" />
        </div>
        <div className="banner-item  rounded-[15px] overflow-hidden px-[15px cursor-pointer">
        <img className='w-full  transition-all duration-300 ease-in-out bject-cover' src="https://i.ibb.co.com/YW69Z2v/Grey-Minimalist-Special-Offer-Banner-Landscape-400-x-230-px-2.jpg" alt="" />
        </div>
        <div className="banner-item  rounded-[15px] overflow-hidden px-[15px cursor-pointer">
        <img className='w-full  transition-all duration-300 ease-in-out bject-cover' src="https://i.ibb.co.com/0JSMjcs/Green-and-White-Clean-Graphic-Sales-and-Promos-Business-Banner-400-x-230-px-1.jpg" alt="" />
        </div>
      </div>
    </div>
  )
}