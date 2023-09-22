// src/routes.tsx

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../Auth/Login";
import Signup from "../Auth/Signup";
import DefaultLayout from "../components/DefaultLayout";
import DrawGraphStep from "../components/DrawGraphStep";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private Routes */}
        <Route path="/" element={<DefaultLayout />} />
        <Route path="/graph" element={<DrawGraphStep />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
