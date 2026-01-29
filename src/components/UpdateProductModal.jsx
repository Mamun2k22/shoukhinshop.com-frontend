import { useQuery } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from "react";

const UpdateProductModal = ({ isOpen, isClose }) => {
  if (!isOpen) return null;

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // Track image upload status
  const [sizeWeights, setSizeWeights] = useState([{ size: "", weight: "" }]); // Store size and weight

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}api/categories`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories: {error.message}</div>;

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.name);
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = (event) => {
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Check if the total number of images exceeds the limit of 4
    if (imageUrl.length >= 4) {
      alert("You can upload a maximum of 4 images.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);

    try {
      const imgBBResponse = await fetch(
        "https://api.imgbb.com/1/upload?key=31cbdc0f8e62b64424c515941a8bfd73",
        {
          method: "PUT",
          body: formData,
        }
      );

      const imgData = await imgBBResponse.json();

      if (imgData.success) {
        // Add the new image URL to the existing array
        setImageUrl((prevImageUrl) => [...prevImageUrl, imgData.data.url]);
      } else {
        console.error("Error uploading image:", imgData.error);
      }
    } catch (error) {
      console.error("Error uploading image", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle changes for size and weight inputs
  const handleSizeWeightChange = (index, field, value) => {
    const updatedSizeWeights = [...sizeWeights];
    updatedSizeWeights[index][field] = value;
    setSizeWeights(updatedSizeWeights);
  };

  // Add new size/weight entry
  const handleAddSizeWeight = () => {
    setSizeWeights([...sizeWeights, { size: "", weight: "" }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const sizeWeightArray = sizeWeights.map((sw) => ({
      size: sw.size,
      weight: sw.weight,
    }));

    const formData = { 
      productName: event.target.productName.value,
      categoryName: selectedCategory,
      productImage: imageUrl, // Submit the array of image URLs
      brand: event.target.brand.value,
      price: event.target.price.value,
      discount: event.target.discount.value,
      status: event.target.status.value,
      stock: event.target.stock.value,
      sizeWeight: sizeWeightArray, // Array of sizeWeight objects
      details: event.target.details.value,
      longDetails: event.target.longDetails.value
    };
    
    console.log("Form Data:", formData);

    // Make POST API call to submit the form data
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}api/products/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // If the response is successful, reset the form
        toast.success("Product Update successfully!");
        event.target.reset(); 
      } else {
        console.log("Product updated successfully!");
      }
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-96 p-6 lg:w-[45%] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Update Product</h2>
            <button onClick={isClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Product Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Product Name</label>
              <input type="text" className="w-full p-2 rounded outline-none border border-blue-500" placeholder="Apple iMac 27''" name="productName" />
            </div>

            {/* Category */}
            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Category</label>
              <div className="flex">
                <input type="text" className="w-full p-2 outline-none border-[0.5px] border-r-0 border-blue-500 rounded-l" placeholder="Select or type a category" value={selectedCategory} onClick={() => setIsDropdownOpen(!isDropdownOpen)} readOnly />
                <button type="button" className="bg-gray-200 border border-gray-300 rounded-r p-2" onClick={handleDropdownToggle}>
                  ▼
                </button>
              </div>
              {isDropdownOpen && (
                <div className="absolute bg-white border border-gray-300 mt-1 w-full z-10 rounded-md shadow-lg max-h-80 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category._id} className="p-2 hover:bg-blue-100 cursor-pointer" onClick={() => handleCategorySelect(category)}>
                      {category.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Product Image (Maximum 4)
        </label>
        <input
          type="file"
          onChange={handleImageUpload}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={imageUrl.length >= 4} // Disable input when 4 images are uploaded
        />
        {isUploading && <p>Uploading image...</p>}

        {/* Display uploaded images */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          {imageUrl.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Uploaded ${index + 1}`}
              className="w-full h-40 object-cover rounded"
            />
          ))}
        </div>

        {/* Display a message if the limit is reached */}
        {imageUrl.length === 4 && (
          <p className="text-red-500 mt-2">
            Maximum of 4 images uploaded.
          </p>
        )}
      </div>
            {/* Brand, Price, Discount, Status, Stock */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Brand</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" placeholder="Apple" name="brand" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Price</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" placeholder="৳2300" name="price" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Discount</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" placeholder="৳20" name="discount" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Status</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" placeholder="Available" name="status" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Stock</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" placeholder="Optional" name="stock" />
            </div>

            {/* Size/Weight Fields */}
            {sizeWeights.map((sw, index) => (
              <div key={index} className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Size & Weight {index + 1}</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="w-1/2 p-2 border border-gray-300 rounded"
                    placeholder="Size"
                    value={sw.size}
                    onChange={(e) => handleSizeWeightChange(index, "size", e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-1/2 p-2 border border-gray-300 rounded"
                    placeholder="Weight"
                    value={sw.weight}
                    onChange={(e) => handleSizeWeightChange(index, "weight", e.target.value)}
                  />
                </div>
              </div>
            ))}

            {/* Button to Add More Size/Weight */}
            <div className="mb-4">
              <button type="button" onClick={handleAddSizeWeight} className="text-blue-500 underline">
                + Add another size & weight
              </button>
            </div>

            {/* Details */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Product Short Details</label>
              <textarea className="w-full p-2 border border-gray-300 rounded" rows="4" placeholder="Details" name="details" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Product Long Details</label>
              <textarea className="w-full p-2 border border-gray-300 rounded" rows="4" placeholder="Details" name="longDetails" />
            </div>
          

            <div className="mt-6">
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                Update Product
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} />
    </div>
  );
};

export default UpdateProductModal;
