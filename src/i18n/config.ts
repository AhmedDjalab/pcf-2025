import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translation from "./en/translation.json";
import translationDE from "./de/translation.json";
import translationFR from "./fr/translation.json";
import translationES from "./es/translation.json";

export const storedLanguage = localStorage.getItem("language") || "en";

i18next.use(initReactI18next).init({
  lng: storedLanguage,
  debug: true,
  resources: {
    en: {
      translation,
    },
    es: {
      translation: translationES,
    },
    fr: {
      translation: translationFR,
    },
    de: {
      translation: translationDE,
    },
  },
  // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
  // set returnNull to false (and also in the i18next.d.ts options)
  // returnNull: false,
});

export function changeLanguage(newLanguage: any) {
  i18next.changeLanguage(newLanguage);
  localStorage.setItem("language", newLanguage);
}
