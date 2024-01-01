// AboutUsComponent.tsx

import React from "react";

import {
  EnvelopeIcon,
  CircleStackIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

import logo from "src/assets/Logo/logo.png";
import companyLogo from "src/assets/Logo/companyLogo.png";
import DefaultLayout from "./DefaultLayout";

const AboutUs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <div className=" dark:bg-boxdark  h-screen flex flex-col items-center justify-center space-y-8">
        <div className="flex space-x-4 my-10">
          <img src={logo} alt="PCF" className="h-40 w-80" />
          <img src={companyLogo} alt="Logo 2" className="h-40 w-80" />
        </div>
        <p className="text-center dark:text-white text-gray-500 ">
          {t("AboutUs.welcomingMessage")}
        </p>
        <p className="text-center dark:text-white text-gray-500 ">
          {t("AboutUs.description")}
        </p>

        <hr />
        <span className="text-gray-500 dark:text-white">
          {t("AboutUs.isProductOF")}
        </span>
        <div className="flex space-x-4 items-center">
          <EnvelopeIcon className="h-8 w-8 text-blue-600" />
          <span>{t("AboutUs.Contact")}</span>
          <span className="text-blue-600">admin@ientreprize.com</span>
        </div>

        <div className="flex space-x-4 items-center">
          <GlobeAltIcon className="h-8 w-8 text-blue-600" />
          <span>{t("AboutUs.Explore")}</span>
          <span className="text-blue-600">
            <a
              href="https://www.ientreprize.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.ientreprize.com
            </a>
          </span>
        </div>

        <div className="text-center text-gray-500 text-sm dark:text-white">
          &copy; {new Date().getFullYear()} iEntrepriZe.
          {t("AboutUs.Allrightsreserved")}.
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AboutUs;
