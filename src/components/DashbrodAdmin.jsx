import { useMemo } from "react";
import { FaUsers, FaBoxOpen } from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";

import DashboardStats from "./DashboardStats";
import MonthlySalesChart from "./MonthlySalesChart";
import DashboardProductStock from "./DashboardProductStock";
import TodayOrders from "./ui/TodayOrders";
import useAdminDashboardStats from "../hooks/useAdminDashboardStats";


const DashbrodAdmin = () => {
  // ✅ hook থেকে data আসবে
  const { loading, stats } = useAdminDashboardStats();

  const cards = useMemo(
    () => [
      {
        title: "Total Order",
        count: stats.totalOrders,
        icon: <AiOutlineClockCircle className="text-yellow-500 text-3xl" />,
        color: "text-yellow-500",
      },
      {
        title: "Total Sales",
        count: `BDT ${stats.totalSales}`,
        icon: <AiOutlineClockCircle className="text-yellow-500 text-3xl" />,
        color: "text-yellow-500",
      },
      {
        title: "Total Users",
        count: stats.totalUsers,
        icon: <FaUsers className="text-blue-500 text-3xl" />,
        color: "text-blue-500",
      },
      {
        title: "Total Products",
        count: stats.totalProducts,
        icon: <FaBoxOpen className="text-green-500 text-3xl" />,
        color: "text-green-500",
      },
    ],
    [stats]
  );

  return (
    <div>
      <div className="container items-center px-2 py-4 m-auto mt-0">
        <DashboardStats />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-1 mt-4">
          {cards.map((stat, index) => (
            <div key={index} className="relative">
              <div
                className="
                  relative rounded-2xl p-[1px]
                  bg-gradient-to-r from-indigo-300/50 via-sky-300/40 to-fuchsia-300/50
                  hover:from-indigo-400/70 hover:via-sky-400/60 hover:to-fuchsia-400/70
                  transition-colors
                "
              >
                <div
                  className="
                    relative flex items-center justify-start gap-4 lg:gap-6 rounded-2xl
                    bg-white/90 dark:bg-slate-900/70 backdrop-blur-md
                    shadow-sm hover:shadow-lg transition
                    px-6 py-4 overflow-hidden h-32
                  "
                >
                  {/* watermark */}
                  <svg
                    className={`absolute right-3 bottom-2 h-10 w-10 opacity-30 ${stat.color || ""}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="3" y="12" width="3" height="9" rx="1"></rect>
                    <rect x="9" y="8" width="3" height="13" rx="1"></rect>
                    <rect x="15" y="4" width="3" height="17" rx="1"></rect>
                    <rect x="21" y="10" width="3" height="11" rx="1"></rect>
                  </svg>

                  {/* icon */}
                  <div className="bg-gray-100 dark:bg-slate-800 rounded-full p-3 shrink-0">
                    {stat.icon}
                  </div>

                  {/* text */}
                  <div>
                    <h4 className="text-gray-500 dark:text-slate-400 text-sm font-medium">
                      {stat.title}
                    </h4>

                    {/* count */}
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {loading ? "..." : stat.count}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <TodayOrders />
        </div>

        <div className="flex flex-col md:flex-row w-full mt-4 gap-2">
          <div className="w-full md:w-[100%]">
            <MonthlySalesChart />
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full mt-4 gap-4">
          <div className="w-full md:w-full">
            <DashboardProductStock />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashbrodAdmin;
