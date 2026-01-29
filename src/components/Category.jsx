import React, { useEffect, useState } from "react";

const Category = ({ isOpen, onClose, onSuccess, mode = "add", initialData }) => {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);      // new file (if chosen)
  const [imageURL, setImageURL] = useState("");          // current image url
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE =
    import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000/";

  // when modal open / initialData change, fill form
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setImageURL(initialData?.image || "");
      setImageFile(null);
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Category name is required");
      return;
    }

    if (mode === "add" && !imageFile) {
      setErrorMessage("Please select an image");
      return;
    }

    let finalImageURL = imageURL;

    try {
      // 1️⃣ যদি নতুন ফাইল select করা হয়, আগে ImgBB তে upload
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imgBBResponse = await fetch(
          "https://api.imgbb.com/1/upload?key=31cbdc0f8e62b64424c515941a8bfd73",
          {
            method: "POST",
            body: formData,
          }
        );

        const imgBBResult = await imgBBResponse.json();

        if (!imgBBResponse.ok) {
          throw new Error("Image upload failed");
        }

        finalImageURL = imgBBResult.data.url;
      }

      // 2️⃣ backend call
      let url = `${API_BASE}api/categories`;
      let method = "POST";

      if (mode === "edit" && initialData?._id) {
        url = `${API_BASE}api/categories/${initialData._id}`;
        method = "PUT";
      }

      const backendResponse = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName: name,
          image: finalImageURL,
        }),
      });

      const backendResult = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(backendResult.message || "Failed to save category");
      }

      setSuccessMessage(
        mode === "add"
          ? "Category added successfully!"
          : "Category updated successfully!"
      );

      if (onSuccess) {
        // backendResult.category এ updated/created data আছে
        onSuccess(backendResult.category);
      }

      if (mode === "add") {
        // add করার পর ফর্ম clear
        setName("");
        setImageFile(null);
        setImageURL("");
        event.target.reset();
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 lg:w-4/12 border border-blue-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold font-quicksand">
            {mode === "add" ? "Add Category" : "Edit Category"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {successMessage && (
          <p className="text-green-600 mb-4">{successMessage}</p>
        )}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Category Name
            </label>
            <input
              type="text"
              name="categoryName"
              className="w-full p-2 rounded outline-none border border-blue-500"
              placeholder="Apple iMac"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Category Image
            </label>
            <input
              type="file"
              className="w-full p-2 border border-gray-300 rounded"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {/* current image preview */}
            {(imageFile || imageURL) && (
              <div className="mt-2">
                {imageFile && (
                  <p className="text-sm text-gray-500">{imageFile.name}</p>
                )}
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : imageURL}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-32 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            {mode === "add" ? "Add Category" : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Category;
