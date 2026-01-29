// src/pages/Buynow.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/userContext";
import districts from "../data/districts";

import OrderSummaryPanel from "../components/OrderSummaryPanel";
import PaymentDetailsForm from "../components/PaymentDetailsForm";
import useShippingSettings, { isCampaignActive } from "../hooks/useShippingSettings";

const API_BASE = (import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");

const Buynow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const [buynowItems, setBuynowItems] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);

  // ✅ shipping settings from hook (admin controlled)
  const { shipSettings, loading: shipLoading, error: shipError } = useShippingSettings();

  // Load product from navigation state
  useEffect(() => {
    const pd = location.state?.productDetails;
    if (pd) setBuynowItems([pd]);
    else console.error("No product details provided!");
  }, [location.state?.productDetails]);

  // load saved address
  useEffect(() => {
    if (user) {
      const savedAddress = user.address || user.fullAddress || "";
      setFullAddress(savedAddress);
    }
  }, [user]);

  // subtotal (price * qty)
  const subTotal = useMemo(
    () =>
      buynowItems.reduce((t, it) => {
        const price = Number(it.price) || 0;
        const qty = Number(it.quantity) || 1;
        return t + price * qty;
      }, 0),
    [buynowItems]
  );

  // ✅ AUTO zone from district: Dhaka = inside, all others = outside
  const districtZone = useMemo(() => {
    if (!selectedDistrict) return null;
    return String(selectedDistrict).trim() === "Dhaka" ? "inside" : "outside";
  }, [selectedDistrict]);

  const shippingLabel = useMemo(() => {
    if (!selectedDistrict) return "Select district";
    return districtZone === "inside" ? "Inside Dhaka" : "Outside Dhaka";
  }, [selectedDistrict, districtZone]);

  // ✅ shipping computed ONLY from admin settings
  const shippingBase = useMemo(() => {
    if (!selectedDistrict) return 0;

    const insideRate = Number(shipSettings?.insideDhakaRate);
    const outsideRate = Number(shipSettings?.outsideDhakaRate);

    // admin data না আসলে shipping 0 (no hardcode)
    if (!Number.isFinite(insideRate) || !Number.isFinite(outsideRate)) return 0;

    const zone = districtZone; // must be inside/outside now
    let base = zone === "inside" ? insideRate : outsideRate;

    // ✅ district all-time free (admin controlled)
    const freeDistricts = (shipSettings?.freeForDistricts || []).map(String);
    if (freeDistricts.includes(String(selectedDistrict))) return 0;

    // ✅ threshold (campaign > global)
    const threshold = isCampaignActive(shipSettings?.campaign)
      ? Number(shipSettings?.campaign?.freeThreshold || 0)
      : Number(shipSettings?.freeThreshold || 0);

    if (threshold > 0 && subTotal >= threshold) return 0;

    return base;
  }, [shipSettings, districtZone, selectedDistrict, subTotal]);

  // after-discount values (never below 0)
  const shippingAfterDiscount = Math.max(0, shippingBase - (shippingDiscount || 0));
  const subtotalAfterDiscount = Math.max(0, subTotal - (couponDiscount || 0));

  // grand total
  const totalPrice = subtotalAfterDiscount + shippingAfterDiscount;

  // ======= Apply/Remove coupon =======
  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return toast.info("Enter a coupon code.");

    if (!selectedDistrict) {
      toast.error("Please select a district first.", { position: "top-center" });
      return;
    }

    setCouponLoading(true);
    try {
      const itemsPayload = buynowItems.map((it) => ({
        productId: it.productId,
        qty: Number(it.quantity) || 1,
        price: Number(it.price) || 0,
      }));

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

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
          shippingOption: districtZone === "inside" ? "inside" : "outside",
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

      toast.success(data.message || "Coupon applied!");
    } catch (e) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setShippingDiscount(0);
      toast.error(e.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setShippingDiscount(0);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // ======= Submit Order =======
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
    if (!buynowItems.length) {
      toast.error("No product found.", { position: "top-center" });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartItems: buynowItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        selectedSize: item.selectedSize || null,
        selectedWeight: item.selectedWeight || null,
        selectedColor: item.selectedColor || null,
      })),
      district: selectedDistrict,
      shippingOption: districtZone === "inside" ? "inside" : "outside",
      paymentMethod: "Cash on Delivery",
      shippingCost: shippingAfterDiscount,
      totalCost: totalPrice,
      pricing: {
        subtotal: subTotal,
        couponDiscount,
        shippingBase,
        shippingDiscount,
        subtotalAfterDiscount,
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
      const response = await fetch(`${API_BASE}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        toast.success("Order placed successfully!", { position: "top-center" });
        navigate("/dashboard/order");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          "There was an issue placing the order: " + (errorData.message || "Please try again."),
          { position: "top-center" }
        );
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { position: "top-center" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!buynowItems.length) {
    return <p className="p-6">No product details provided. Please try again.</p>;
  }

  return (
    <div>
      {/* optional debug */}
      {shipLoading && <p className="px-6 pt-4 text-sm text-gray-500">Loading shipping settings…</p>}
      {shipError && <p className="px-6 pt-2 text-sm text-red-500">{shipError}</p>}

      {/* header */}
      <div className="flex flex-col items-center border-b bg-white py-4 sm:flex-row sm:px-10 lg:px-20 xl:px-32 font-poppins">
        <span className="text-2xl font-bold text-gray-800">Product Order Page</span>
      </div>

      {/* grid */}
      <div className="grid lg:grid-cols-2 lg:px-10 xl:px-20 font-poppins">
        <OrderSummaryPanel
          items={buynowItems}
          shippingLabel={shippingLabel}
          shippingAfterDiscount={shippingAfterDiscount}
          selectedDistrict={selectedDistrict}
        />

        <PaymentDetailsForm
          user={user}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          appliedCoupon={appliedCoupon}
          couponDiscount={couponDiscount}
          shippingDiscount={shippingDiscount}
          couponLoading={couponLoading}
          applyCoupon={applyCoupon}
          removeCoupon={removeCoupon}
          fullAddress={fullAddress}
          setFullAddress={setFullAddress}
          districts={districts}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={(d) => {
            setSelectedDistrict(d);
            setAppliedCoupon(null);
            setCouponDiscount(0);
            setShippingDiscount(0);
          }}
          subTotal={subTotal}
          shippingBase={shippingBase}
          shippingAfterDiscount={shippingAfterDiscount}
          totalPrice={totalPrice}
          submitting={submitting}
          handleSubmit={handleSubmit}
        />
      </div>

      <ToastContainer />
    </div>
  );
};

export default Buynow;
