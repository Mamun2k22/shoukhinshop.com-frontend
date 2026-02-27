import React from "react";
import { Helmet } from "react-helmet-async";

import Features from "../../components/Features";

import OurBrands from "../../components/OurBrands";

import HeroSlider from "../../components/HomeHero/HeroSlider";

import ProductCategory from "../productCategory/ProductCategory";
import MenCollection from "../../components/ui/MenCollection";
import WomenCollection from "../../components/ui/WomenCollection";
import KidCollection from "../../components/ui/KidCollection";
import FeaturesBar from "../../components/FeaturesBar";
import AccessoriesCollection from "../../components/ui/AccessoriesCollection";
import HomeMarqueeBar from "../../../src/components/ui/HomeMarqueeBar";
import RecentlyViewed from "../../components/RecentlyViewed";
import PopularProduct from "./sections/popularProducts/PopularProducts";
import GifBannerSection from "../../components/GifBannerSection";
import DailyBestSeller from "./sections/dailyProducts/DailySellerSldier";
import FourBanner from "../../components/FourBanner";
import { Ban } from "lucide-react";
import BannerSection from "../../components/BannerSection";

const Home = () => {
  return (
    <div className="">
      <Helmet>
        <title>shoukhinshop</title>
        <meta name="description" content="M.M trading Center" />
        <meta
          name="keywords"
          content="Soukhinshop, online store, best deals, top products, daily bestsellers, popular categories"
        />
        <link rel="canonical" href="https://www.mmtrading.com/" />
      </Helmet>
      {/* Main Title */}
      <h1 className=" hidden text-lg md:text-3xl font-bold text-center mt-4 text-blue-500">
        Shoukhinshop - Your Trusted Online Store
      </h1>
      <HeroSlider />
      {/* <MarqueeRtl /> */}
      {/* <HomeMarqueeBar /> */}
      <ProductCategory />
      <BannerSection />
   
      <PopularProduct />

   

      <FeaturesBar />
   
       <FourBanner />
         <DailyBestSeller />
      <div className="mt-7">
        <OurBrands />
      </div>
    
         <RecentlyViewed />
    </div>
  );
};

export default Home;
