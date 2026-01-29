import React from "react";
import { Link } from "react-router-dom";

export default function Wishlist() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-5xl rounded-2xl border bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-2xl">🚧</span>
          </div>

          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Wishlist is under development
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              We’re working on this feature. Soon you’ll be able to save products
              and manage your favorites here.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Back to Home
              </Link>

              <Link
                to="/all-product"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs text-slate-500">
                Tip: If you reached here by mistake, please check the menu link
                or try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
