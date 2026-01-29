import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import BannerList from "./BannerList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HeroUpload = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.image[0]) formData.append("image", data.image[0]);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}api/banners`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message);
      reset();
    } catch (error) {
      console.error(
        "Error posting Banner:",
        error.response?.data || error.message
      );
      setMessage("Failed to create notice. Please try again.");
    }
  };

  return (
   <>
    {/* <div className="p-4">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold">Post a Banner</h3>
        <img
          className="w-5 h-5"
          src="https://cdn-icons-png.flaticon.com/128/3161/3161837.png"
          alt=""
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-blue-200 mt-3">
     
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Banner Title (optional)
            </label>
            <input
              type="text"
              placeholder="Enter the title here"
              {...register("title")}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>


          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Upload Image
            </label>
            <input
              type="file"
              {...register("image")}
              className="w-full p-3 border rounded-lg focus:outline-none"
              accept="image/*"
            />
          </div>

  

          <button
            type="submit"
            className="bg-gradient-to-r from-[#32568f] to-[#4c48a8] text-white px-6 py-1.5 rounded-lg  transition-colors"
          >
            Post
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div> */}
    
    <BannerList />
    
    </>
  );
};

export default HeroUpload;
