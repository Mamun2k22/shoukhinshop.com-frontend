// src/router/Router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/home/Home";
import ProductDetails from "../pages/home/sections/ProductDetails/ProductDetails";
import Dashboard from "../layout/DashboardLayout/Dashboard";
import Cart from "../components/Cart";
import Product from "../components/Product";
import User from "../components/User";
import DashbrodAdmin from "../components/DashbrodAdmin";
import MyProfile from "../components/MyProfile";
import Order from "../components/Order";
import Review from "../components/Review";
import CategoryProduct from "../components/CategoryProduct";
import Signup from "../Auth/Signup";
// import ForgotPassword from "../Auth/ForgotPassword";
import Category from "../components/Category";

import Checkout from "../pages/checkOut/Checkout";
import CheckoutTwo from "../pages/checkOut/CheckoutTwo";
import Otp from "../components/Otp";
import { AdminRoute } from "../hooks/useAdmin";
import { Test } from "../components/Test";
import Buynow from "../components/Buynow"
import ResetPassword from "../Auth/ResetPassword";
import { UserRoute } from "../hooks/userRole";
import { ShareRoute } from "../hooks/useShareRoute";
import AllOrders from "../components/AllOrders";
import HeroUpload from "../components/HeroUpload";
import CreateProduct from "../components/product/CreateProduct";
import Producttwo from "../components/product/Producttwo";

// NEW
import SearchResults from "../pages/search/SearchResults";
import SellerVerificationForm from "../pages/seller/SellerVerificationForm";
import AdminVerificationList from "../pages/admin/AdminVerificationList";
import AdminVerificationApproved from "../pages/admin/AdminVerificationApproved";
import MyInvoices from "../pages/user/MyInvoices";
import AdminInvoices from "../pages/admin/AdminInvoices";
import AdminCoupons from "../components/AdminCoupons";
// import AdminShippingSettings from "../pages/admin/AdminShippingSettings";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminSubCategory from "../pages/admin/AdminSubCategory";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import WomenSubCategories from "../components/ui/WomenSubCategories";
import MenSubCategories from "../components/ui/MenSubCategories";
import KidsSubCategories from "../components/ui/KidsSubCategories";
import CategoryFilterProduct from "../components/ui/CategoryFilterProduct";
import CarowselToCategories from "../components/ui/CarowselToCategories";
import SectionCategoriDetails from "../components/ui/SectionCategoriDetails";
import AllProductsHeader from "../components/ui/AllProductsHeader";
import Color from "../components/Color";
import AdminBrands from "../components/ui/AdminBrands";
import AccessoriesSubCategories from "../components/ui/AccessoriesSubCategories";
import ChangePassword from "../components/ui/userProfile/ChangePassword";
import LogoSettings from "../components/ui/LogoSettings";
import SettingHomeSection from "../components/ui/SettingHomeSection";
import AdminTickerSettings from "../components/ui/AdminTickerSettings";
import Wishlist from "../components/Wishlist";
import ConfirmOrders from "../components/ui/ConfirmOrders";
import CancelOrders from "../components/ui/CancelOrders";
import DeliveredOrders from "../components/ui/DeliveredOrders";
import SalesReport from "../components/ui/SalesReport";
import HeaderSectionSettings from "../components/ui/HeaderSectionSettings";
import AdminShippingSettings from "../components/ui/AdminShippingSettings";
import GeneralSetting from "../components/ui/GeneralSetting";
import ForgotPassword from "../pages/ForgotPassword";



const withBase = (p) => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  return `${base.replace(/\/$/, "")}/${String(p).replace(/^\//, "")}`;
};

export const router = createBrowserRouter([
   { path: "/admin-login", element: <AdminLoginPage /> },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> }, // "/" -> Home

      // 🚀 admin login
      { path: "admin/login", element: <AdminLoginPage /> },
      { path: "search", element: <SearchResults /> },

      // product details
      {
        path: "product-details/:id",
        element: <ProductDetails />,
        loader: ({ params }) => fetch(withBase(`api/products/${params.id}`)),
      },

   
           {
        path: "category/:slug",
        element: <SectionCategoriDetails />,
      },
   {
        path: "category/:name",
        element: <CategoryProduct />,
        loader: ({ params }) => fetch(withBase(`api/category/${params.name}`)),
      },
      // auth
      { path: "login", element: <Signup /> },
      { path: "otp-verify", element: <Otp /> },
      // { path: "forget-password", element: <ForgotPassword /> },
      
      { path: "/forgot-password", element: <ForgotPassword /> },
      // misc
      { path: "test", element: <Test /> },
      { path: "checkout", element: <Checkout /> },
      { path: "buy-checkout", element: <Buynow /> },
      { path: "checkout2", element: <CheckoutTwo /> },
      { path: "create", element: <CreateProduct /> },
      { path: "producttwo", element: <Producttwo /> },
      { path: "/all-product", element: <AllProductsHeader /> },
      {
        path: "/womensub",
        element: <WomenSubCategories />,
      },
      {
        path: "/mensub",
        element: <MenSubCategories />,
      },
      {
        path: "/kidsub",
        element: <KidsSubCategories />,
      },
      {
        path: "/accessories",
        element: <AccessoriesSubCategories />,
      },
      {
        path: "/category-products",
        element: <CategoryFilterProduct />,
      },
      {
        path: "/shop-category",
        element: <CarowselToCategories />,
      },
      
      // (optional) backward-compat: old URL -> redirect to dashboard route
      {
        path: "seller/verification",
        element: <Navigate to="/dashboard/verification" replace />,
      },
    ],
  },

  // DASHBOARD (all children are relative — no leading slash)
  {
    path: "dashboard",
    element: <Dashboard />,
    children: [
      // dashboard home: /dashboard
      {
        index: true,
        element: (
          <AdminRoute>
            <DashbrodAdmin />
          </AdminRoute>
        ),
      },

      // ---- ADMIN ONLY ----
      {
        path: "seller",
        element: (
          <AdminRoute>
            <AdminVerificationList />
          </AdminRoute>
        ),
      },
      {
        path: "seller-approved", // 👈 NEW
        element: (
          <AdminRoute>
            <AdminVerificationApproved />
          </AdminRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <AdminRoute>
            <AllOrders />
          </AdminRoute>
        ),
      },
      {
        path: "hero",
        element: (
          <AdminRoute>
            <HeroUpload />
          </AdminRoute>
        ),
      },
      {
        path: "product",
        element: (
          <AdminRoute>
            <Product />
          </AdminRoute>
        ),
      },
      {
        path: "create",
        element: (
          <AdminRoute>
            <CreateProduct />
          </AdminRoute>
        ),
      },
      {
        path: "category",
        element: (
          <AdminRoute>
            <Category />
          </AdminRoute>
        ),
      },
      {
        path: "color",
        element: (
          <AdminRoute>
            <Color />
          </AdminRoute>
        ),
      },
      {
        path: "brands",
        element: (
          <AdminRoute>
            <AdminBrands />
          </AdminRoute>
        ),
      },
      {
        path: "user",
        element: (
          <AdminRoute>
            <User />
          </AdminRoute>
        ),
      },
      {
        path: "review",
        element: (
          <AdminRoute>
            <Review />
          </AdminRoute>
        ),
      },
      {
        path: "invoices",
        element: (
          <AdminRoute>
            <AdminInvoices />
          </AdminRoute>
        ),
      },
      {
        path: "coupon",
        element: (
          <AdminRoute>
            <AdminCoupons />
          </AdminRoute>
        ),
      },
      {
        path: "shiping",
        element: (
          <AdminRoute>
            <AdminShippingSettings />
          </AdminRoute>
        ),
      },
      {
        path: "categories",
        element: (
          <AdminRoute>
            <AdminCategories />
          </AdminRoute>
        ),
      },
      {
        path: "subcategories",
        element: (
          <AdminRoute>
            <AdminSubCategory />
          </AdminRoute>
        ),
      },
      {
        path: "setting-logo",
        element: (
          <AdminRoute>
            <LogoSettings />
          </AdminRoute>
        ),
      },
      {
        path: "setting-section",
        element: (
          <AdminRoute>
            <SettingHomeSection />
          </AdminRoute>
        ),
      },
      {
        path: "setting-header",
        element: (
          <AdminRoute>
            <HeaderSectionSettings/>
          </AdminRoute>
        ),
      },

      {
        path: "setting-ticker",
        element: (
          <AdminRoute>
            <AdminTickerSettings />
          </AdminRoute>
        ),
      },
      {
        path: "setting-shipping",
        element: (
          <AdminRoute>
              <AdminShippingSettings />
          </AdminRoute>
        ),
      },
      {
        path: "general-setting",
        element: (
          <AdminRoute>
              <GeneralSetting />
          </AdminRoute>
        ),
      },
      {
        path: "confirm-orders",
        element: (
          <AdminRoute>
            <ConfirmOrders />
          </AdminRoute>
        ),
      },
      {
        path: "delivery-orders",
        element: (
          <AdminRoute>
            <DeliveredOrders />
          </AdminRoute>
        ),
      },
      {
        path: "cancel-orders",
        element: (
          <AdminRoute>
            <CancelOrders />
          </AdminRoute>
        ),
      },
      {
        path: "sales-report",
        element: (
          <AdminRoute>
            <SalesReport />
          </AdminRoute>
        ),
      },
 

      // ---- USER ONLY ----
      {
        path: "cart",
        element: (
          <UserRoute>
            <Cart />
          </UserRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ShareRoute>
            <MyProfile />
          </ShareRoute>
        ),
      },
      {
        path: "order",
        element: (
          <UserRoute>
            <Order />
          </UserRoute>
        ),
      },

      // ✅ Seller self-verification (now inside dashboard)
      {
        path: "verification",
        element: (
          <UserRoute>
            <SellerVerificationForm />
          </UserRoute>
        ),
      },
      // USER
      {
        path: "my-invoices",
        element: (
          <UserRoute>
            <MyInvoices />
          </UserRoute>
        ),
      },
      {
        path: "setting",
        element: (
          <UserRoute>
            <ChangePassword />
          </UserRoute>
        ),
      },
      {
        path: "wishlist",
        element: (
          <UserRoute>
            <Wishlist/>
          </UserRoute>
        ),
      },
    ],
  },
]);
