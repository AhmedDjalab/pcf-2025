import React, { useEffect } from "react";
import { useAuth } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DropdownLanguage from "./DropdownLanguage";
import { useTranslation } from "react-i18next";
import Logo from "src/assets/Logo/darklogoSmall.png";
import {
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  QueueListIcon,
} from "@heroicons/react/24/solid";
import DarkModeSwitcher from "./DarkModeSwitcher";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showNav, setShowNav] = useState(false); // State to toggle visibility of navigation on smaller screens
  const { isAdmin } = useAuth();
  const [popupVisible, setPopupVisible] = useState(false);

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
  };
  const handleToggleNav = () => {
    setShowNav(!showNav);
  };

  useEffect(() => {
    const handleWindowResize = () => {
      // Check screen width to decide when to hide/show the nav links
      if (window.innerWidth > 768) {
        setShowNav(false); // Reset to hide nav on larger screens
      }
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return (
    <header className="text-white  bg-boxdark text-center flex flex-col items-center ">
      <div className="flex justify-between items-center w-full dark:shadow-md">
        <img src={Logo} alt="logo" className="h-20 w-20 object-contain" />

        <div className="flex justify-start items-center space-x-10 ml-10">
          <div className="md:hidden" onClick={handleToggleNav}>
            <button className="flex items-center mr-10">
              <svg
                className="h-6 w-6 text-white cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    showNav ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
          <div className="hidden md:flex justify-start items-center space-x-10 ml-10">
            {/* <NavLink
              to="/create-project"
              text={t("header.createProject")}
              icon={<HomeIcon className="w-6 h-6" />}
            /> */}
            <NavLink
              to="/projects"
              text={t("header.projects")}
              icon={<QueueListIcon className="w-6 h-6" />}
            />
            {isAdmin && (
              <NavLink
                to="/employees"
                text={t("header.users")}
                icon={<UserGroupIcon className="w-6 h-6" />}
              />
            )}
            {/* <NavLink
              to="/pricing"
              text={t("header.pricing")}
              icon={<CurrencyDollarIcon className="w-6 h-6" />}
            /> */}
            <NavLink
              to="/about-us"
              text={t("header.aboutUs")}
              icon={<InformationCircleIcon className="w-6 h-6" />}
            />
          </div>

          {showNav && (
            <div className="md:hidden flex flex-col absolute top-20 bg-white rounded-lg left-0 dark:bg-boxdark p-8 gap-5 text-bodydark2 shadow-md dark:text-white">
              <NavLink
                to="/create-project"
                text={t("header.createProject")}
                icon={<HomeIcon className="w-6 h-6" />}
              />
              <NavLink
                to="/projects"
                text={t("header.projects")}
                icon={<QueueListIcon className="w-6 h-6" />}
              />
              <NavLink
                to="/employees"
                text={t("header.users")}
                icon={<UserGroupIcon className="w-6 h-6" />}
              />
              {/* <NavLink
              to="/pricing"
              text={t("header.pricing")}
              icon={<CurrencyDollarIcon className="w-6 h-6" />}
            /> */}
              <NavLink
                to="/about-us"
                text={t("header.aboutUs")}
                icon={<InformationCircleIcon className="w-6 h-6" />}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end items-center ">
          <div className="md:ml-4">
            <DarkModeSwitcher />
          </div>
          <div className="md:ml-4">
            <DropdownLanguage />
          </div>
          <p className="text-lg px-5 mb-2 hidden md:flex">
            {t("header.contact")}
            <span className="text-lg text-blue-600">
              &nbsp;admin@ientreprize.com
            </span>
          </p>
          {user && (
            <div className="relative inline-block">
              <div
                className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center cursor-pointer"
                onClick={togglePopup}
              >
                <span className="text-lg font-semibold text-white">
                  {user?.email?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              {popupVisible && (
                <div className="absolute z-50 text-black right-0 mt-2 bg-white text-black-500 text-sm px-4 py-2 rounded-lg shadow-lg">
                  <p className="mb-2 font-semibold">{user.email}</p>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="hover:bg-blue-100 px-2 py-1 rounded-lg focus:outline-none"
                  >
                    {t("header.logout")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  text: string;
  icon: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, text, icon }) => {
  return (
    <a
      href={to}
      className="text-gray-500 hover:text-white flex items-center space-x-2 cursor-pointer"
    >
      {icon}
      <span>{text}</span>
    </a>
  );
};

export default Header;
