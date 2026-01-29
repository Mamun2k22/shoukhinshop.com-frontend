import React from 'react';
import logo from '../../assets/images/logo.png'
import ChatWidget from '../ChatWidget';

const Footer = () => {P
  return (
    <footer className="bg-[#F1F5F9] py-6 font-poppins mt-5">
      <div id="contact" className="container mx-auto px-4">
        <div className="flex justify-around">
          {/* Logo and Description */}
          <div className=" mb-8 md:mb-0 text-sm">
            <img src="https://i.ibb.co.com/s1Lw5vj/mobile.png" alt="Bholamart Logo" className="mb-4 h-14 w-auto" />
            
            <div className="mt-4">
              <p className="text-gray-600">
                <strong>Address:</strong> House # 07, Block # F, Road # 04 Banani, Dhaka-1213, Bangladesh
              </p>
              <p className="text-gray-600">
                <strong>Call Us:</strong> (+88)01826167946
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> bholamart24@gmail.com
              </p>
              <p className="text-gray-600">
                <strong>Hours:</strong> 24-Hours, Saturday - Thursday
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="w-full md:w-3/5 mb-8 md:mb-0 hidden md:block">
            <div className="flex flex-wrap justify-between">
              {['Company', 'Company', 'Corporate', 'Popular'].map((title, index) => (
                <div key={index} className="w-1/2 md:w-1/5 mb-6 md:mb-0">
                  <h5 className="font-bold text-gray-700">{title}</h5>
                  <ul className="mt-4 space-y-2 text-sm">
                    {[ 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Support Center'].map((item, i) => (
                      <li key={i} className="text-gray-600 hover:text-gray-800 transition-colors">
                        <a href="#">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

       
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-wrap justify-between items-center lg:mt-5 mt-3 border-t pt-3 text-sm">
          <p className="text-gray-600 text-center md:text-left">&copy; 2022, Bholamart</p>
          <div className="flex space-x-4 mt-4 md:mt-0 ">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600 font-bold">1900 - 888</span>
              <span className="text-gray-600">24/7 Support Center</span>


            </div>
         
          </div>
   
    
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
       <ChatWidget/>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
