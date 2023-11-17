import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { DrawGraphForm } from "./DrawGraphForm";
import Header from "./Header";
import DrawGraphStep from "./DrawGraphStep";
import { tokenKeys } from "src/variables/Urls";
import { IsAuth, useAuth } from "src/context/UserContext";

function DefaultLayout({ children }: any) {
  const token: any = IsAuth();
  const { user } = useAuth();
  console.log("🚀 ~ file: DefaultLayout.tsx:12 ~ DefaultLayout ~ user:", user);
  return (
    <>
      {token ? (
        <>
          <div className="w-full relative">
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
