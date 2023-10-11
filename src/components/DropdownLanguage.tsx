import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n/config";
import moment from "moment";
import { languages } from "../const/vars";

const DropdownLanguage = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find((x) => x.code === i18n.language);
  const countryCode = currentLanguage
    ? currentLanguage.countryCode.toLowerCase()
    : "";

  const imageUrl = `/country/${countryCode}.svg`;
  return (
    <div className="relative inline-block ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 
        rounded-md   px-2 py-1  focus:outline-none dark:text-white "
      >
        <div
          className="h-6 w-6 rounded-full  bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <span className="hidden md:flex">
          {t(
            `language.${languages.find((x) => x.code === i18n.language)?.name}`
          )}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-30 mt-2  w-48 rounded-md bg-white py-2 shadow-lg dark:bg-boxdark-2 dark:text-white">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white focus:outline-none dark:text-white"
            >
              <div
                className="h-6 w-6 rounded-full  bg-no-repeat"
                style={{
                  backgroundImage: `url(/country/${language.countryCode.toLowerCase()}.svg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <span>{t(language.name)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownLanguage;
