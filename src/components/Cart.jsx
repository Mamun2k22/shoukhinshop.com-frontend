import React, { useEffect, useState } from "react";
import useCart from "../hooks/useCart";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../hooks/userContext";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLoaderData } from "react-router-dom";

const Cart = () => {
  const productDetailsData = useLoaderData(); // (used if needed elsewhere)

  const [cart, refetch] = useCart();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id;
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const initialQuantities = cart.reduce((acc, item) => {
      acc[item._id] = item.quantity || 1;
      return acc;
    }, {});
    setQuantities(initialQuantities);
  }, [cart]);

  const updateCartQuantity = async (itemId, newQuantity) => {
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/cart/${userId}/${itemId}`,
        { quantity: newQuantity }
      );

      queryClient.setQueryData(["cart", userId], (oldCart) => {
        if (!oldCart) return [];
        return oldCart.map((item) =>
          item._id === itemId
            ? {
                ...item,
                ...data.cartItem,
              }
            : item
        );
      });

      toast.success("Quantity updated successfully!");
    } catch (error) {
      console.error("Error updating quantity:", error);

      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update quantity.");
      }
    }
  };

  const handleIncrease = async (itemId) => {
    const current = quantities[itemId] || 1;
    const next = current + 1;
    setQuantities((prev) => ({ ...prev, [itemId]: next }));
    await updateCartQuantity(itemId, next);
  };

  const handleDecrease = async (itemId) => {
    const current = quantities[itemId] || 1;
    const next = Math.max(current - 1, 1);
    setQuantities((prev) => ({ ...prev, [itemId]: next }));
    await updateCartQuantity(itemId, next);
  };

  const subTotal = cart.reduce(
    (total, item) => total + item.itemPrice * item.quantity,
    0
  );

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_APP_SERVER_URL}api/cart/${userId}/${itemId}`
      );
      toast.success("Item successfully deleted!", {
        position: "top-center",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      queryClient.setQueryData(["cart", userId], (oldCart) => {
        return oldCart.filter((item) => item._id !== itemId);
      });
    } catch (error) {
      console.error("Error deleting item:", error);

      toast.error("Error deleting item from cart.", {
        position: "top-center",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      refetch();
    }
  };

  const qtyBadge =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700 border border-gray-200";
  const sizeBadge =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-700 border border-blue-100";
  const colorBadge =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-purple-50 text-purple-700 border border-purple-100";

  return (
    <>
      <div className="text-center font-poppins text-lg xl:text-2xl py-5">
        <h1 className="text">Shopping Cart</h1>
      </div>

      <div className="p-1">
        <div className="font-sans">
          <div className="flex md:flex-row flex-col md:w-[100%] w-full gap-2 max-lg:max-w-3xl">
            {/* cart table */}
            <div className="md:w-[77%] w-full bg-white divide-y divide-gray-300">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <tr className="md:font-bold font-quicksand text-white font-medium md:text-[16px] text-[14px]">
                    <th className="text-left py-3 pl-2">Product Details</th>
                    <th className="text-center py-3">Quantity</th>
                    <th className="text-center py-3">Price</th>
                    <th className="text-center py-3">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-300 font-poppins"
                    >
                      {/* product + size/color */}
                      <td className="py-4 flex items-center md:w-[340px] w-[200px] gap-3">
                        <div className="md:w-28 w-16 h-24 md:h-28 shrink-0 rounded-xl bg-gray-50 border flex items-center justify-center overflow-hidden">
                          <img
                            src={item.productId?.productImage}
                            alt={item.productId?.productName || "Product image"}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-normal text-gray-700 md:w-80 w-32">
                            {item.productId?.productName}
                          </h3>

                          {(item.selectedSize ||
                            item.selectedColor ||
                            item.selectedWeight) && (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {/* Qty badge (optional, nice info) */}
                              <span className={qtyBadge}>
                                Qty: {item.quantity || 1}
                              </span>

                              {item.selectedSize && (
                                <span className={sizeBadge}>
                                  Size: {item.selectedSize}
                                </span>
                              )}

                              {item.selectedWeight && (
                                <span className={qtyBadge}>
                                  Weight: {item.selectedWeight}
                                </span>
                              )}

                              {item.selectedColor && (
                                <span className={colorBadge}>
                                  <span className="mr-1">
                                    Color: {item.selectedColor}
                                  </span>
                                  <span
                                    className="inline-block w-2.5 h-2.5 rounded-full border border-white/60"
                                    style={{ background: item.selectedColor }}
                                  />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* quantity controls */}
                      <td className="text-center py-4">
                        <div className="flex items-center justify-center md:gap-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item._id)}
                            className="flex items-center justify-center md:w-5 md:h-5 h-4 w-4 bg-blue-600 outline-none rounded-full"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-2 fill-white"
                              viewBox="0 0 124 124"
                            >
                              <path d="M112 50H12C5.4 50 0 55.4 0 62s5.4 12 12 12h100c6.6 0 12-5.4 12-12s-5.4-12-12-12z"></path>
                            </svg>
                          </button>
                          <span className="font-bold text-sm leading-[18px]">
                            {quantities[item._id]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item._id)}
                            className="flex items-center justify-center md:w-5 md:h-5 h-4 w-4 bg-blue-600 outline-none rounded-full"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-2 fill-white"
                              viewBox="0 0 42 42"
                            >
                              <path d="M37.059 16H26V4.941C26 2.224 23.718 0 21 0s-5 2.224-5 4.941V16H4.941C2.224 16 0 18.282 0 21s2.224 5 4.941 5H16v11.059C16 39.776 18.282 42 21 42s5-2.224 5-4.941V26h11.059C39.776 26 42 23.718 42 21s-2.224-5-4.941-5z"></path>
                            </svg>
                          </button>
                        </div>
                      </td>

                      {/* price */}
                      <td className="text-center py-4">
                        <h4 className="text-base font-semibold text-gray-800">
                          {item.itemPrice}
                        </h4>
                      </td>

                      {/* delete */}
                      <td className="text-center py-4">
                        <div
                          onClick={() => handleDelete(item._id)}
                          className="flex justify-center items-center w-8 h-8 bg-red-100 rounded-full cursor-pointer hover:bg-red-200 md:ml-4 ml-4"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 fill-red-500 inline cursor-pointer"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z" />
                            <path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Zm4 0v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* summary / shipping */}
            <div className="lg:w-[28%] bg-[#F1F5F9] p-6 lg:sticky top-0 shadow-lg rounded border border-blue-500 h-full">
              <ul className="text-gray-800 divide-y divide-gray-300">
                <li className="flex flex-wrap gap-4 text-sm pb-4 font-semibold">
                  Subtotal <span className="ml-auto">TK {subTotal}</span>
                </li>
                <li className="flex flex-wrap gap-4 text-sm py-4 font-semibold">
                  Shipping <span className="ml-auto">TK 0</span>
                </li>
                <li className="flex flex-wrap gap-4 text-sm pt-4 font-bold">
                  Total Price <span className="ml-auto">TK {subTotal}</span>
                </li>
              </ul>

              <Link
                to={{
                  pathname: "/checkout",
                }}
              >
                <button
                  type="button"
                  className="mt-8 max-w-md text-sm px-6 py-3 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-blue-700 text-white font-semibold tracking-wide rounded-lg"
                >
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default Cart;
