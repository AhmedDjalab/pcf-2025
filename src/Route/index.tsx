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

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private Routes */}
        {/* <Route path="/" element={<DefaultLayout />} /> */}
        <Route path="/" element={<DrawGraphForm />} />

        <Route path="/employees" element={<Employees />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/create-project" element={<DrawGraphForm />} />
        {/* <Route path="/pricing" element={<PricingComponent />} />
        <Route path="/about-us" element={<AboutUsComponent />} />
        <Route path="/create-project" element={<CreateProjectComponent />} />
        <Route path="/projects" element={<ProjectsComponent />} /> */}
        <Route path="/graph" element={<DrawGraphStep />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
