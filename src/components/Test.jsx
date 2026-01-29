"use client";

import { useState } from "react";
import {
  HiChartPie,
  HiClipboard,
  HiCollection,
  HiInformationCircle,
  HiLogin,
  HiPencil,
  HiSearch,
  HiShoppingBag,
  HiUsers,
  HiX,
} from "react-icons/hi";
import { Link } from "react-router-dom";

export const Test = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <>
   {/* <div className="md:hidden block flex justify-between items-center gap-2 w-full  px-3.5 pl-2 py-2 ">
        <div className="">
          <Link to={"/"}>
            <img
              src="https://i.ibb.co.com/s1Lw5vj/mobile.png"
              alt="Bholamart"
              className="lg:h-14 h-8 w-auto object-cover"
            />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {mobleToggle ? (
            <svg
              onClick={mobileMenueOpen}
              className="transition duration-300"
              fill="#000"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                fill="currentColor"
                d="M18.36 5.64a.996.996 0 0 0-1.41 0L12 10.59 7.05 5.64a.996.996 0 1 0-1.41 1.41L10.59 12 5.64 16.95a.996.996 0 1 0 1.41 1.41L12 13.41l4.95 4.95a.996.996 0 1 0 1.41-1.41L13.41 12l4.95-4.95c.39-.39.39-1.02 0-1.41z"
              />
            </svg>
          ) : (
            <svg
              onClick={mobileMenueOpen}
              className="transition duration-300"
              fill="#000"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                fill="currentColor"
                d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
              />
            </svg>
          )}
        </div>
      </div> */}
    </>
  );
};
