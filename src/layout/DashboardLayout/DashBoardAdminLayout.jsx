import React from "react";
import TopNav from "../../components/TopNav";
import { Outlet } from "react-router-dom";
import DashbrodAdmin from "../../components/DashbrodAdmin";

const DashBoardAdminLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <DashbrodAdmin />

      {/* Main Content */}
      <div className="flex flex-col flex-1 bg-gray-50 overflow-auto">
        {/* <TopNav /> */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashBoardAdminLayout;
