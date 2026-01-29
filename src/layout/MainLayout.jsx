import React from 'react';
import { Outlet } from 'react-router-dom';
import NewFooter from '../components/footer/NewFooter';
import Navigation from '../components/navigation/Navigation';
import ScrollToTop from '../context/ScrollToTop';

const MainLayout = () => {
    return (
        <div>
              <ScrollToTop />
            <Navigation/>
            <Outlet/>
             <NewFooter />
             
        </div>
    );
};

export default MainLayout;