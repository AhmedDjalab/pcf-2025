import React from "react";
import { EnvelopeIcon, GlobeAltIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

import logo from "src/assets/Logo/logo.png";
import companyLogo from "src/assets/Logo/companyLogo.png";
import DefaultLayout from "./DefaultLayout";

const AboutUs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <div className=" dark:bg-boxdark min-h-screen flex flex-col items-center justify-center p-6">
        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl w-full">
          {/* Images Section */}
          <div className="flex flex-col items-center space-y-6">
            <img
              src={logo}
              alt="PCF"
              className="w-40 sm:w-56 lg:w-72 xl:w-80 max-w-full h-auto"
            />
            <img
              src={companyLogo}
              alt="Company Logo"
              className="w-40 sm:w-56 lg:w-72 xl:w-80 max-w-full h-auto"
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            <p className="text-black font-semibold text-lg sm:text-xl lg:text-2xl max-w-xl mx-auto lg:mx-0">
              {t("AboutUs.welcomingMessage")}
            </p>
            <p className="text-black text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0">
              {t("AboutUs.description")}
            </p>

            <hr className="w-full border-t border-gray-300 dark:border-gray-600" />

            <div className="text-black text-base">
              {t("AboutUs.isProductOF")}
            </div>

            {/* Contact Section */}
            <div className="flex items-center space-x-2 justify-center lg:justify-start">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              <span className="text-black text-base">
                {t("AboutUs.Contact")}
              </span>
              <span className="text-blue-600 break-words">
                admin@ientreprize.com
              </span>
            </div>

            <div className="flex items-center space-x-2 justify-center lg:justify-start">
              <GlobeAltIcon className="h-6 w-6 text-blue-600" />
              <span className="text-black text-base">
                {t("AboutUs.Explore")}
              </span>
              <a
                href="https://www.ientreprize.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 break-words underline"
              >
                www.ientreprize.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-black mt-12">
          &copy; {new Date().getFullYear()} iEntrepriZe.{" "}
          {t("AboutUs.Allrightsreserved")}.
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AboutUs;
