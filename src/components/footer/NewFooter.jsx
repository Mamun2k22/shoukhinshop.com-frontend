import { FaFacebookF, FaInstagram, FaYoutube, FaTimes } from "react-icons/fa";
import {
  FaCcAmex,
  FaCcApplePay,
  FaGooglePay,
  FaCcMastercard,
  FaCcPaypal,
  FaCcVisa,
} from "react-icons/fa6";
import useGeneralSettingsPublic from "../../hooks/useGeneralSettings"; // path adjust

export default function Footer() {
  const { data } = useGeneralSettingsPublic();

  // fallback values (যদি API fail হয়)
  const phone = data?.phone || "+88 01773444720";
  const email = data?.email || "Info@shoukhinshoplifestyle.com";
  const address =
    data?.address ||
    "EI Mercado,114, Begum Rokeya Avenue, Mirpur-10, Dhaka, Bangladesh";
    const description =
  data?.description ||
  "We believe that every human deserves to feel beautiful and confident, and we are committed to providing you with the best quality and styles that will make you look and feel your best.";


  return (
    <footer className="bg-white
 text-gray-700 py-12 font-manrope mt-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* LEFT column */}
        <div className="flex flex-col justify-between">
          <ul className="space-y-3 text-sm font-medium">
            <li><a href="#" className="hover:text-white">Shop</a></li>
            <li><a href="#" className="hover:text-white">FAQ</a></li>
            <li><a href="#" className="hover:text-white">Shipping</a></li>
            <li><a href="#" className="hover:text-white">Returns</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Terms &amp; Conditions</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
          </ul>

 
        </div>

        {/* MIDDLE column */}
        <div className="text-gray-800">
          <h3 className="text-lg font-bold ">{phone}</h3>
          <p className="text-sm uppercase font-semibold  mt-1">
            24/7 Personal Support
          </p>
        <p className="mt-4 text-sm leading-relaxed ">
  {description}
</p>

          <p className="mt-6 text-sm ">
            © 2025 shoukhinshop. All Rights Reserved.
          </p>
        </div>

        {/* RIGHT column */}
        <div>
          <p className="text-sm font-semibold text-white">
            Monday - Friday: 10:00-6:00 PM
          </p>

          <p className="mt-2 text-sm">
            <span className="font-semibold">Phone:</span> {phone}
          </p>

          <p className="mt-2 text-sm">
            <span className="font-semibold">Email:</span> {email}
          </p>

          <p className="mt-2 text-sm">
            <span className="font-semibold">Address:</span> {address}
          </p>

          {/* Social icons */}
          <div className="flex gap-4 mt-6">
            <a
              href="https://www.facebook.com/shoukhinshoplifestyle"
              className="w-10 h-10 flex items-center justify-center border border-gray-600 hover:bg-white hover:text-black transition rounded"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/shoukhinshoplifestyle"
              className="w-10 h-10 flex items-center justify-center border border-gray-600 hover:bg-white hover:text-black transition rounded"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center border border-gray-600 hover:bg-white hover:text-black transition rounded"
            >
              <FaTimes />
            </a>
            <a
              href="https://youtube.com/@shoukhinshoplifestyle"
              className="w-10 h-10 flex items-center justify-center border border-gray-600 hover:bg-white hover:text-black transition rounded"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
