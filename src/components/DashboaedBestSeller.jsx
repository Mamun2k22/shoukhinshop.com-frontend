import React from 'react';
const sellers = [
  {
    name: "Robert",
    purchases: "73 Purchases",
    categories: "Kitchen, Pets",
    total: "$1,000",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Calvin",
    purchases: "66 Purchases",
    categories: "Health, Grocery",
    total: "$4,000",
    image: "https://randomuser.me/api/portraits/men/30.jpg",
  },
  {
    name: "Dwight",
    purchases: "15,890 Purchases",
    categories: "Electronics",
    total: "$2,700",
    image: "https://randomuser.me/api/portraits/men/29.jpg",
  },
  {
    name: "Cody",
    purchases: "15 Purchases",
    categories: "Movies, Music",
    total: "$2,100",
    image: "https://randomuser.me/api/portraits/men/28.jpg",
  },
  {
    name: "Bruce",
    purchases: "127 Purchases",
    categories: "Sports, Fitness",
    total: "$4,400",
    image: "https://randomuser.me/api/portraits/men/27.jpg",
  },
  {
    name: "Jorge",
    purchases: "30 Purchases",
    categories: "Toys, Baby",
    total: "$4,750",
    image: "https://randomuser.me/api/portraits/men/26.jpg",
  },

];

const DashboaedBestSeller = () => {
    return (
        <div>
             <div className="bg-white p-5 rounded-xl shadow-sm w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Best Shop Sellers</h2>
        <button className="text-sm text-gray-500 hover:text-blue-600">View all ▾</button>
      </div>
      <div className="space-y-4">
        {sellers.map((seller, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src={seller.image}
                alt={seller.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{seller.name}</p>
                <p className="text-xs text-gray-500">{seller.purchases}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 w-28 truncate">{seller.categories}</div>
            <div className="font-medium text-gray-900">{seller.total}</div>
          </div>
        ))}
      </div>
    </div> 
        </div>
    );
};

export default DashboaedBestSeller;