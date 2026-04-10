import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, PhoneCall } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order || null;

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-green-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Order Placed Successfully
          </h1>

          <p className="mt-3 text-slate-600 max-w-lg leading-7">
            ধন্যবাদ। আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। খুব দ্রুত আমাদের
            টিম আপনার সাথে যোগাযোগ করবে।
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Order Summary</h2>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-slate-500">Order ID</p>
              <p className="mt-1 font-semibold text-slate-900 break-all">
                {order?._id || "Will be shared soon"}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-slate-500">Status</p>
              <p className="mt-1 font-semibold capitalize text-emerald-700">
                {order?.orderStatus || "pending"}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-slate-500">Payment</p>
              <p className="mt-1 font-semibold text-slate-900">
                {order?.paymentMethod || "Cash on Delivery"}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-slate-500">Total</p>
              <p className="mt-1 font-semibold text-slate-900">
                ৳ {Number(order?.totalPrice || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <PhoneCall className="w-5 h-5 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-800 leading-6">
            অনুগ্রহ করে আপনার ফোন চালু রাখুন। অর্ডার কনফার্ম করার জন্য আমাদের
            প্রতিনিধি কল করতে পারে।
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to="/shop"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 font-semibold hover:opacity-95 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>

          <button
            onClick={() => navigate("/")}
            className="flex-1 rounded-xl border border-slate-300 bg-white text-slate-800 px-5 py-3 font-semibold hover:bg-slate-50 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;