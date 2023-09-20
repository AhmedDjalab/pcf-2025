import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DrawGraphForm } from "./DrawGraphForm";
import Header from "./Header";

function DefaultLayout() {
  const token: any = localStorage.getItem("token");
  return (
    <>
      {token ? (
        <>
          <div className="p-4 " style={{ marginTop: "20px" }}>
            <Header />
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
