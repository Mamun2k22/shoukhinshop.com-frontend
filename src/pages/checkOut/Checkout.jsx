import React, { useEffect, useMemo, useState } from "react";
import { FaAddressCard, FaUser } from "react-icons/fa";
import cash from "../../../src/assets/images/cash.png";
import useCart from "../../hooks/useCart";
import useCartActions from "../../context/useCartActions";
import { useUser } from "../../hooks/userContext";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import districts from "../../data/districts";

import useShippingSettings, { isCampaignActive } from "../../hooks/useShippingSettings";

const API_BASE = (import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");

const BuyCheckout = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // === Coupon states ===
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);

  // ✅ shipping settings from hook (admin controlled)
  const { shipSettings, loading: shipLoading, error: shipError } = useShippingSettings();

  // ✅ auto shipping option from district
  const [selectedOption, setSelectedOption] = useState("inside");

  const navigate = useNavigate();
  const [cart] = useCart();
  const { user } = useUser();

  const { quantities, handleIncrease, handleDecrease, handleDelete, subTotal } =
    useCartActions(cart);

  // ✅ auto fill address
  useEffect(() => {
    if (user) {
      setFullAddress(user.address || user.fullAddress || "");
    }
  }, [user]);

  // ✅ district -> inside/outside auto + reset coupon
  useEffect(() => {
    if (!selectedDistrict) return;
    const opt = String(selectedDistrict).trim() === "Dhaka" ? "inside" : "outside";
    setSelectedOption(opt);

    setAppliedCoupon(null);
    setCouponDiscount(0);
    setShippingDiscount(0);
  }, [selectedDistrict]);

  // ✅ shipping base (BuyNow-like) - no hardcoded fallback
  const shippingBase = useMemo(() => {
    if (!selectedDistrict) return 0;

    const insideRate = Number(shipSettings?.insideDhakaRate);
    const outsideRate = Number(shipSettings?.outsideDhakaRate);

    // admin data না এলে shipping 0 (no hardcode)
    if (!Number.isFinite(insideRate) || !Number.isFinite(outsideRate)) return 0;

    let base = selectedOption === "inside" ? insideRate : outsideRate;

    // ✅ district all-time free
    const freeDistricts = (shipSettings?.freeForDistricts || []).map(String);
    if (freeDistricts.includes(String(selectedDistrict))) return 0;

    // ✅ threshold (campaign > global)
    const threshold = isCampaignActive(shipSettings?.campaign)
      ? Number(shipSettings?.campaign?.freeThreshold || 0)
      : Number(shipSettings?.freeThreshold || 0);

    if (threshold > 0 && subTotal >= threshold) return 0;

    return base;
  }, [shipSettings, selectedOption, selectedDistrict, subTotal]);

  // shipping after coupon discount
  const shippingAfterCoupon = Math.max(0, shippingBase - (shippingDiscount || 0));

  // final total
  const totalPrice = useMemo(
    () => Math.max(0, subTotal + shippingAfterCoupon - (couponDiscount || 0)),
    [subTotal, shippingAfterCoupon, couponDiscount]
  );

  // === Apply coupon (BuyNow-like) ===
  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return toast.info("Enter a coupon code", { position: "top-center" });

    if (!selectedDistrict) {
      toast.error("Please select a district first.", { position: "top-center" });
      return;
    }

    try {
      setCouponLoading(true);

      const itemsPayload = cart.map((it) => ({
        productId: it.productId._id,
        qty: quantities?.[it._id] ?? 1,
        price: it.itemPrice,
      }));

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      // ✅ same as BuyNow
      const res = await fetch(`${API_BASE}/api/cart/apply-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code,
          subtotal: subTotal,
          shipping: shippingBase,
          items: itemsPayload,
          userId: user?.id,
          district: selectedDistrict,
          shippingOption: selectedOption,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) || {};
        throw new Error(err.message || "Invalid coupon");
      }

      const data = await res.json();

      setAppliedCoupon(data.applied || data.coupon || { code });
      setCouponDiscount(Number(data.couponTotal ?? data.discountAmount ?? 0));
      setShippingDiscount(Number(data.shippingDiscount ?? data.shippingOff ?? 0));

      toast.success(data.message || "Coupon applied!", { position: "top-center" });
    } catch (e) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setShippingDiscount(0);
      toast.error(e.message || "Failed to apply coupon", { position: "top-center" });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setShippingDiscount(0);
    setCouponCode("");
    toast.info("Coupon removed", { position: "top-center" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDistrict) {
      toast.error("Please select a district.", { position: "top-center" });
      return;
    }
    if (!fullAddress) {
      toast.error("Please provide a full address.", { position: "top-center" });
      return;
    }
    if (!cart.length) {
      toast.error("Your cart is empty.", { position: "top-center" });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartItems: cart.map((item) => ({
        productId: item.productId._id,
        quantity: quantities?.[item._id] ?? 1,
        price: item.itemPrice,
        selectedSize: item.selectedSize,
        selectedWeight: item.selectedWeight,
        selectedColor: item.selectedColor,
      })),

      district: selectedDistrict,
      shippingOption: selectedOption,

      paymentMethod: "Cash on Delivery",
      shippingCost: shippingAfterCoupon,
      totalCost: totalPrice,

      pricing: {
        subtotal: subTotal,
        couponDiscount,
        shippingBase,
        shippingDiscount,
        subtotalAfterDiscount: Math.max(0, subTotal - couponDiscount),
      },

      coupon: appliedCoupon ? { code: appliedCoupon.code, id: appliedCoupon._id || null } : null,

      customer: {
        name: user?.name || "",
        email: user?.email || "",
        mobile: user?.mobile || "",
      },

      address: fullAddress,
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        toast.success("Order placed successfully!", { position: "top-center" });
        navigate("/dashboard/order");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to place order. Please try again.", {
          position: "top-center",
        });
      }
    } catch (err) {
      toast.error("Network error. Please try again.", { position: "top-center" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* optional debug */}
      {shipLoading && <p className="px-6 pt-3 text-sm text-gray-500">Loading shipping settings…</p>}
      {shipError && <p className="px-6 pt-2 text-sm text-red-500">{shipError}</p>}

      {/* header */}
      <div className="flex flex-col items-center border-b bg-white py-4 sm:flex-row sm:px-10 lg:px-20 xl:px-32 font-poppins">
        <span className="text-2xl font-bold text-gray-800">Product Order Page</span>
      </div>

      {/* grid */}
      <div className="grid lg:grid-cols-2 lg:px-10 xl:px-20 font-poppins">
        {/* LEFT */}
        <div className="px-4 pt-8 w-[350px] md:w-full">
          <p className="text-xl font-medium">Order Summary</p>
          <p className="text-gray-400">Check your item and select a suitable shipping method.</p>

          {/* cart items */}
          <div className="mt-8 rounded-lg border border-purple-400 bg-white px-2 py-2 md:px-4 md:py-4 w-full">

            {cart.map((item) => {
              const qty = quantities?.[item._id] ?? 1;

              return (
                <div key={item._id} className="flex items-center justify-between rounded-lg bg-white mb-4">
                  <div className="flex items-center">
                    <img
                      className="m-2 lg:h-24 lg:w-28 h-16 w-16 rounded-md border object-cover object-center"
                      src={item?.productId?.productImage || "https://via.placeholder.com/100"}
                      alt={item?.productId?.productName || "Product Image"}
                    />
                    <div className="flex md:w-full w-64 flex-col px-4 py-4">
                      <span className="font-medium">
                        {item?.productId?.productName?.length > 34
                          ? `${item.productId.productName.slice(0, 34)}...`
                          : item?.productId?.productName}
                      </span>

                      <div className="flex items-center justify-between mt-2">
                        <h4 className="text-base font-semibold text-gray-800">TK {item.itemPrice}</h4>

                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (qty <= 1) handleDelete(item._id);
                              else handleDecrease(item._id);
                            }}
                            className="flex items-center justify-center w-5 h-5 bg-blue-600 outline-none rounded-full"
                          >
                            <span className="text-white text-xs">-</span>
                          </button>

                          <span className="font-bold text-sm leading-[18px]">{qty}</span>

                          <button
                            type="button"
                            onClick={() => handleIncrease(item._id)}
                            className="flex items-center justify-center w-5 h-5 bg-blue-600 outline-none rounded-full"
                          >
                            <span className="text-white text-xs">+</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {item?.selectedSize && (
                          <p className="text-sm">
                            <span className="font-semibold">Size:</span> {item.selectedSize}
                          </p>
                        )}
                        {item?.selectedWeight && (
                          <p className="text-sm">
                            <span className="font-semibold">Weight:</span> {item.selectedWeight}
                          </p>
                        )}
                        {item?.selectedColor && (
                          <p className="text-sm">
                            <span className="font-semibold">Color:</span> {item.selectedColor}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleDelete(item._id)}
                    className="flex justify-center items-center w-8 h-8 bg-red-100 rounded-full cursor-pointer hover:bg-red-200 mr-3"
                  >
                    🗑️
                  </div>
                </div>
              );
            })}
          </div>

          {/* payment */}
          <p className="mt-8 text-lg font-medium">Select Payment Methods</p>
          <div className="mt-5 grid gap-5">
            <div className="relative w-[350px] md:w-full">
              <input className="peer hidden" id="radio_cod" type="radio" name="radio" defaultChecked readOnly />
              <span className="peer-checked:border-blue-600 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
              <label
                className="peer-checked:border-2 peer-checked:border-purple-600 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                htmlFor="radio_cod"
              >
                <div className="flex items-center ml-2">
                  <img className="h-12 w-12" src={cash} alt="Cash on Delivery" />
                  <div className="ml-5">
                    <span className="mt-2 font-semibold">Cash on Delivery</span>
                    <p className="text-slate-500 text-sm leading-6">Delivery: 2-3 Days</p>
                  </div>
                </div>
              </label>
            </div>

            {/* shipping info */}
            <div className="mt-2 rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Shipping (auto)</p>
                  <p className="font-semibold text-gray-900">
                    {selectedDistrict ? (selectedOption === "inside" ? "Inside Dhaka" : "Outside Dhaka") : "Select district"}
                  </p>
                  {selectedDistrict && <p className="text-xs text-gray-500 mt-1">District: {selectedDistrict}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Charge</p>
                  <p className="font-bold">TK {shippingAfterCoupon}</p>
                </div>
              </div>
              {!selectedDistrict && (
                <p className="text-xs text-gray-400 mt-2">Choose district from the right panel to calculate shipping.</p>
              )}
            </div>

            {/* coupon */}
            <div className="mt-2 rounded-lg border bg-white p-3">
              <label className="text-sm font-medium">Have a coupon?</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {appliedCoupon ? (
                  <button type="button" onClick={removeCoupon} className="px-3 py-2 rounded-md border">
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-60"
                  >
                    {couponLoading ? "Applying…" : "Apply"}
                  </button>
                )}
              </div>

              {appliedCoupon && (
                <div className="mt-2 text-sm text-emerald-700">
                  Applied: <b>{appliedCoupon.code}</b>
                  {couponDiscount > 0 && <> — Saved TK {couponDiscount}</>}
                  {shippingDiscount > 0 && <> — Shipping off TK {shippingDiscount}</>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <form onSubmit={handleSubmit} className="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0">
          <p className="text-xl font-medium">Payment Details</p>
          <p className="text-gray-400">Complete your order by providing your shipping details.</p>

          <div>
            <label className="mt-4 mb-2 block text-sm font-medium">Full Name</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                className="w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500"
                placeholder="your full name"
                defaultValue={user?.name || ""}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                <FaUser className="text-gray-300" />
              </div>
            </div>

            <label className="mt-4 mb-2 block text-sm font-medium">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                className="w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500"
                placeholder="your.email@gmail.com"
                defaultValue={user?.email || ""}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">✉️</div>
            </div>

            <label className="mt-4 mb-2 block text-sm font-medium">Phone No</label>
            <div className="relative">
              <input
                type="tel"
                name="mobile"
                className="w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500"
                placeholder="Your 11 digit phone number"
                defaultValue={user?.mobile || ""}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">📞</div>
            </div>

            <label className="mt-4 mb-2 block text-sm font-medium">Full Address</label>
            <div className="relative">
              <input
                type="text"
                name="address"
                value={fullAddress}
                className="w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500"
                placeholder="Your full address"
                onChange={(e) => setFullAddress(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                <FaAddressCard className="text-gray-300" />
              </div>
            </div>

            <label className="mt-4 mb-2 block text-sm font-medium">Select your District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a district</option>
              {districts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.nameBn})
                </option>
              ))}
            </select>

            {/* totals */}
            <div className="mt-6 border-t border-b py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Subtotal</p>
                <p className="font-semibold text-gray-900">TK {subTotal}</p>
              </div>

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-medium text-emerald-700">Coupon Discount</p>
                  <p className="font-semibold text-emerald-700">− TK {couponDiscount}</p>
                </div>
              )}

              {shippingDiscount > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-medium text-emerald-700">Shipping Discount</p>
                  <p className="font-semibold text-emerald-700">− TK {shippingDiscount}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-medium text-gray-900">Delivery Charge</p>
                <p className="font-semibold text-gray-900">TK {shippingAfterCoupon}.00</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Total</p>
              <p className="text-2xl font-semibold text-gray-900">TK {totalPrice}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 mb-8 w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Placing…" : "Place Order"}
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default BuyCheckout;
