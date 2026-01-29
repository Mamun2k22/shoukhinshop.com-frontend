import React from "react";
import cash from "../../src/assets/images/cash.png";

const OrderSummaryPanel = ({
  items,
  shippingLabel,
  shippingAfterDiscount,
  selectedDistrict,
  onDistrictChange, // optional if you want district here instead of right panel
}) => {
  return (
    <div className="px-4 pt-8 w-[350px] md:w-full">
      <p className="text-xl font-medium">Order Summary</p>
      <p className="text-gray-400">
        Check your item and select a suitable shipping method.
      </p>

      <div className="mt-8 rounded-lg border border-purple-400 bg-white px-2 py-1 md:py-4 w-[350px] md:w-full">
        {items.map((item, index) => (
          <div
            key={item._id || index}
            className="flex items-center flex-row rounded-lg bg-white lg:flex-row mb-4"
          >
            <img
              className="m-2 lg:h-24 lg:w-28 h-16 w-16 rounded-md border object-cover object-center"
              src={item.productImage || "https://via.placeholder.com/100"}
              alt={item.productName || "Product Image"}
            />
            <div className="flex md:w-full w-64 flex-col px-4 py-4">
              <span className="font-medium">
                {item.productName?.length > 34
                  ? `${item.productName.slice(0, 34)}...`
                  : item.productName || "Unknown Product"}
              </span>

              <div className="flex md:gap gap-x-6">
                <div className="flex gap-4">
                  <div className="text-center py-4">
                    <h4 className="text-base font-semibold text-gray-800">
                      TK {Number(item.price) || 0}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <p>Quantity:</p>
                    <span className="font-bold text-sm leading-[18px]">
                      {Number(item.quantity) || 1}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {item.selectedSize && (
                    <p className="text-sm">
                      <span className="font-semibold">Size:</span>{" "}
                      {item.selectedSize}
                    </p>
                  )}
                  {item.selectedWeight && (
                    <p className="text-sm">
                      <span className="font-semibold">Weight:</span>{" "}
                      {item.selectedWeight}
                    </p>
                  )}
                  {item.selectedColor && (
                    <p className="text-sm">
                      <span className="font-semibold">Color:</span>{" "}
                      {item.selectedColor}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-lg font-medium">Select Payment Methods</p>
      <div className="mt-5 grid gap-5">
        <div className="relative w-[350px] md:w-full">
          <input
            className="peer hidden"
            id="radio_cod"
            type="radio"
            name="radio"
            defaultChecked
            readOnly
          />
          <span className="peer-checked:border-blue-600 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
          <label
            className="peer-checked:border-2 peer-checked:border-purple-600 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
            htmlFor="radio_cod"
          >
            <div className="flex items-center ml-2">
              <img className="h-12 w-12" src={cash} alt="Cash on Delivery" />
              <div className="ml-5">
                <span className="mt-2 font-semibold">Cash on Delivery</span>
                <p className="text-slate-500 text-sm leading-6">
                  Delivery: 2-3 Days
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <p className="mt-8 text-lg font-medium">Shipping</p>
      <div className="mt-3 flex items-center justify-between rounded-md border bg-white p-3">
        <div>
          <p className="text-sm text-gray-500">Based on district</p>
          <p className="font-semibold text-gray-900">{shippingLabel}</p>
          {selectedDistrict ? (
            <p className="text-xs text-gray-500 mt-1">
              District: {selectedDistrict}
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Select district to calculate</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Charge</p>
          <p className="font-bold">TK {shippingAfterDiscount}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPanel;
