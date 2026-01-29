import React from "react";

const Producttwo = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Add New Product</h2>
          <div className="space-x-3">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Save to Draft
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Publish
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-medium mb-4">Basic</h3>
              <input type="text" placeholder="Product Title" className="w-full mb-4 p-2 border rounded" />
              <textarea placeholder="Full Description" rows={4} className="w-full p-2 border rounded mb-4" />
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input type="number" placeholder="Regular Price $" className="p-2 border rounded" />
                <input type="number" placeholder="Promotional Price $" className="p-2 border rounded" />
                <select className="p-2 border rounded">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>BDT</option>
                </select>
              </div>
              <input type="number" placeholder="Tax Rate %" className="w-full p-2 border rounded mb-2" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" />
                <span>Make a Template</span>
              </label>
            </div>

            {/* Shipping */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-medium mb-4">Shipping</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <input type="text" placeholder="Width (inch)" className="p-2 border rounded" />
                <input type="text" placeholder="Height (inch)" className="p-2 border rounded" />
                <input type="text" placeholder="Weight (gm)" className="p-2 border rounded" />
                <input type="text" placeholder="Shipping Fees $" className="p-2 border rounded" />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            {/* Media */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-medium mb-4">Media</h3>
              <input type="file" className="w-full border rounded p-2" />
            </div>

            {/* Organization */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-medium mb-4">Organization</h3>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Category</label>
                <select className="w-full p-2 border rounded">
                  <option>Automobiles</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Sub-category</label>
                <select className="w-full p-2 border rounded">
                  <option>Nissan</option>
                  <option>Toyota</option>
                  <option>Honda</option>
                </select>
              </div>
              <input type="text" placeholder="Tags (comma separated)" className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Producttwo;
