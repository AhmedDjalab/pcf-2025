// src/routes.tsx

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../Auth/Login";
import Signup from "../Auth/Signup";
import DefaultLayout from "../components/DefaultLayout";
import DrawGraphStep from "../components/DrawGraphStep";
import Employees from "src/pages/Employee";
import Projects from "src/pages/Project";
import { DrawGraphForm } from "src/components/DrawGraphForm";
import EmployeeForm from "src/pages/Employee/EmployeeForm";
import { IsAuth, useAuth } from "src/context/UserContext";
import ViewGraph from "src/pages/Graph/ViewGraph";
import AboutUs from "src/components/AboutUs";
import ErrorPage from "src/pages/ErrorPage";

const AppRoutes = () => {
  const isLogged = IsAuth();
  const { isAdmin } = useAuth();
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<Projects />} />
        {isAdmin && <Route path="/employees" element={<Employees />} />}
        <Route path="/projects" element={<Projects />} />
        <Route path="/create-project" element={<DrawGraphForm />} />
        <Route path="/create-project/:id" element={<DrawGraphForm />} />
        <Route path="/about-us" element={<AboutUs />} />

        <Route path="/graph" element={<DrawGraphStep />} />
        <Route path="/graph/:id" element={<DrawGraphStep />} />
        <Route path="/view-graph/:id" element={<ViewGraph />} />

        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
