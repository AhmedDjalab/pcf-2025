import React from "react";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DropdownLanguage from "./DropdownLanguage";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { user, logoutUser } = useUserContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [popupVisible, setPopupVisible] = useState(false);

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
  };

  return (
    <header className="text-black py-4 text-center flex flex-col items-center">
      <div className="flex justify-end self-end items-center">
        <div className="md:ml-4 ">
          <DropdownLanguage />
        </div>
        <p className="text-xl px-5 mb-2">
          {t("header.contact")}{" "}
          <span className="text-xl text-blue-600">admin@ientreprize.com</span>
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
              <div className="absolute right-0 mt-2 bg-white text-black-500 text-sm px-4 py-2 rounded-lg shadow-lg">
                <p className="mb-2 font-semibold">{user.email}</p>
                <button
                  onClick={() => {
                    logoutUser();
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
    </header>
  );
};

export default Header;
