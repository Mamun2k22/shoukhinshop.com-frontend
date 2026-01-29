import React, { useState } from "react";

const users = [
  {
    id: 1,
    name: "Example Corp",
    email: "business@example.com",
    date: "2024-01-15",
    documents: ["NID Front", "NID Back", "Trade License"],
  },
  {
    id: 2,
    name: "Retail Store LLC",
    email: "retail@store.com",
    date: "2024-01-14",
    documents: ["NID Front", "Trade License", "VAT Certificate"],
  },
];

const Tabs = ["User Verification", "Verified User",];

export const SellerVerification =()=> {
  const [activeTab, setActiveTab] = useState("User Verification");

  const handleApprove = (id) => {
    console.log("Approved user:", id);
  };

  const handleReject = (id) => {
    console.log("Rejected user:", id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex space-x-4 mb-6 border-b border-gray-300">
        {Tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-all duration-200 rounded-t-md ${
              activeTab === tab
                ? "bg-white border border-b-0 border-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "User Verification" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending User Verifications</h2>
          <p className="text-sm text-gray-500 mb-4">
            Review and approve business document submissions
          </p>

          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-md shadow mb-4 border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {user.documents.map((doc, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-sm px-2 py-1 rounded-md border"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  Submitted {user.date}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApprove(user.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(user.id)}
                  className="bg-white border border-gray-300 hover:bg-red-100 text-gray-700 px-4 py-1 rounded-md"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab !== "User Verification" && (
        <div className="text-center text-gray-400 text-sm">
          {activeTab} section coming soon...
        </div>
      )}
    </div>
  );
}
