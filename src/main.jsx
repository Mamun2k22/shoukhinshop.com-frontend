import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router.jsx";
import { UserProvider } from "./hooks/userContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>

        <UserProvider>
          <SearchProvider> 
            <div className="relative">
              <RouterProvider router={router} />
            </div>
          </SearchProvider>
        </UserProvider>

      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
