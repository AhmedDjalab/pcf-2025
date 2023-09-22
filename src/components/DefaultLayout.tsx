import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { DrawGraphForm } from "./DrawGraphForm";
import Header from "./Header";
import DrawGraphStep from "./DrawGraphStep";

function DefaultLayout() {
  const token: any = localStorage.getItem("token");
  return (
    <>
      {token ? (
        <>
          <div className="p-4 " style={{ marginTop: "20px" }}>
            <Header />
            {/* Use the Routes and Route components to define your routes */}
            <DrawGraphForm />
          </div>
        </>
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
}

export default DefaultLayout;
