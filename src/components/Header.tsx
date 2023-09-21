import React from "react";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { user, logoutUser } = useUserContext();
  const navigate = useNavigate();

  const [popupVisible, setPopupVisible] = useState(false);

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
  };

  return (
    <header className=" text-black py-4 text-center">
      <div className="flex items-center justify-between">
        <p className="text-xl  px-5">
          Don't hesitate to send your feedback. our e-mail :
          <span className="text-2xl text-blue-600">admin@ientreprize.com</span>
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
              <div className="absolute right-5 mt-4 bg-white text-black-500 text-sm px-4 py-2 rounded-lg shadow-lg">
                <p className="mb-2 font-semibold">{user.email}</p>
                <button
                  onClick={() => {
                    logoutUser();
                    navigate("/login");
                  }}
                  className="hover:bg-blue-100 px-2 py-1 rounded-lg focus:outline-none"
                >
                  Logout
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
