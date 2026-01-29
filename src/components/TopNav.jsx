// TopNav.jsx
import { FiMenu, FiSearch, FiBell, FiMaximize } from "react-icons/fi";

const TopNav = () => {
  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 ">
      <div className="flex items-center space-x-4">
        <FiMenu className="text-xl text-gray-700" />
        <span className="text-gray-700 font-medium">
          Good Morning, <span className="font-semibold">John Smith</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">

        <FiMaximize className="text-xl text-gray-600 cursor-pointer" />

        <div className="relative">
          <FiBell className="text-xl text-gray-600 cursor-pointer" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            9
          </span>
        </div>

        <div className="flex items-center space-x-2 cursor-pointer">
          <img
            src="https://i.pravatar.cc/40?img=1"
            alt="User"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium text-gray-700">John Smith</span>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
