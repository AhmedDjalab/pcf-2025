import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { DrawGraphForm } from "./DrawGraphForm";
import Header from "./Header";
import DrawGraphStep from "./DrawGraphStep";

function DefaultLayout({ children }: any) {
  const token: any = localStorage.getItem("token");
  return (
    <>
      {token ? (
        <>
          <div>
            <Header />
            {/* Use the Routes and Route components to define your routes */}
            {children}
          </div>
        </>
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
}

export default DefaultLayout;
