import React from "react";
import { FaAddressCard, FaUser } from "react-icons/fa";

// Dhaka metro => inside
const DHAKA_METRO = new Set([
  "Dhaka",
  "Gazipur",
  "Narayanganj",
  "Narsingdi",
  "Munshiganj",
  "Manikganj",
]);

const PaymentDetailsForm = ({
  user,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponDiscount,
  shippingDiscount,
  couponLoading,
  applyCoupon,
  removeCoupon,

  fullAddress,
  setFullAddress,

  districts,
  selectedDistrict,
  setSelectedDistrict,

  // ✅ NEW (auto shipping set)
  selectedOption,           // optional: UI show / debug
  setSelectedOption,        // required for auto calculate
  onDistrictChange,         // optional: parent custom handler (override)

  subTotal,
  shippingBase,
  shippingAfterDiscount,
  totalPrice,

  submitting,
  handleSubmit,
}) => {
  const handleDistrictSelect = (district) => {
    // 1) always keep district state
    setSelectedDistrict(district);

    // 2) allow parent override if provided
    if (typeof onDistrictChange === "function") {
      onDistrictChange(district);
      return;
    }

    // 3) auto set inside/outside
    if (!district) return;
    const isInside = DHAKA_METRO.has(district);
    if (typeof setSelectedOption === "function") {
      setSelectedOption(isInside ? "inside" : "outside");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0"
    >
      <p className="text-xl font-medium">Payment Details</p>
      <p className="text-gray-400">
        Complete your order by providing your shipping details.
      </p>

      {/* coupon box */}
      <div className="mt-4 rounded-lg border bg-white p-3">
        <label className="text-sm font-medium">Have a coupon?</label>
        <div className="mt-2 flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {appliedCoupon ? (
            <button
              type="button"
              onClick={removeCoupon}
              className="px-3 py-2 rounded-md border"
            >
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

      {/* contact & address */}
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
          <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
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
          <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              />
            </svg>
          </div>
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

        {/* ✅ District select => auto inside/outside */}
        <label className="mt-4 mb-2 block text-sm font-medium">
          Select your District
        </label>
        <div className="flex flex-col sm:flex-row">
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictSelect(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a district</option>
            {districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.nameBn})
              </option>
            ))}
          </select>
        </div>

        {/* optional: show auto selected shipping */}
        {selectedDistrict && selectedOption && (
          <p className="mt-2 text-xs text-gray-500">
            Shipping auto selected:{" "}
            <span className="font-semibold">
              {selectedOption === "inside" ? "Inside Dhaka (Metro)" : "Outside Dhaka"}
            </span>
          </p>
        )}

        {/* totals */}
        <div className="mt-6 border-t border-b py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Subtotal</p>
            <p className="font-semibold text-gray-900">TK {subTotal}</p>
          </div>

          {couponDiscount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-700">Coupon discount</p>
              <p className="font-semibold text-emerald-700">
                – TK {couponDiscount}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-medium text-gray-900">Delivery Charge</p>
            <p className="font-semibold text-gray-900">
              TK {shippingAfterDiscount}.00
            </p>
          </div>

          {shippingDiscount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-700">Shipping discount</p>
              <p className="font-semibold text-emerald-700">
                – TK {shippingDiscount}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Base shipping</p>
            <p className="text-xs text-gray-500">TK {shippingBase}.00</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">Total</p>
          <p className="text-2xl font-semibold text-gray-900">
            TK {totalPrice}
          </p>
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
  );
};

export default PaymentDetailsForm;
