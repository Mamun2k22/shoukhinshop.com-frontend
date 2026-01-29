import React, { useState } from "react";
import { BsChatDotsFill, BsX } from "react-icons/bs";
import { FaFacebookMessenger, FaWhatsapp } from "react-icons/fa";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <button
        className="bg-gradient-to-r from-[#436db2] to-[#3730b6] text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition duration-300"
        onClick={toggleChat}
      >
        {isOpen ? <BsX size={24} /> : <BsChatDotsFill size={24} />}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl p-4 mt-2 w-64">
          <h4 className="text-lg font-bold mb-2">Hi there! 👋</h4>
          <p className="text-sm mb-4">
            Let us know if we can help you with anything at all.
          </p>
          <ul>
            <li className="mb-2">
              <a
                href="https://m.me/bholamart24"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 border rounded-lg hover:bg-gray-100"
              >
                <FaFacebookMessenger className="text-blue-600 mr-2" size={20} />
                Messenger
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/+8801826167946"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 border rounded-lg hover:bg-gray-100"
              >
                <FaWhatsapp className="text-green-500 mr-2" size={20} />
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
