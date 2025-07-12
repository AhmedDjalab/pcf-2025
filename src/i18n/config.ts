//@ts-nocheck
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translation from "./en/translation.json";
import translationDE from "./de/translation.json";
import translationFR from "./fr/translation.json";
import translationES from "./es/translation.json";
import translationIT from "./it/translation.json";
import translationJP from "./jp/translation.json";
import widgetFR from "./fr/widget.json";
import hotkeyFR from "./fr/hotkey.json";
import widgetDE from "./de/widget.json";
import hotkeyDE from "./de/hotkey.json";
import widgetEN from "./en/widget.json";
import hotkeyEN from "./en/hotkey.json";
import widgetES from "./es/widget.json";
import hotkeyES from "./es/hotkey.json";
import widgetIT from "./it/widget.json";
import hotkeyIT from "./it/hotkey.json";
import hotkeyJP from "./jp/hotkey.json";
import widgetJP from "./jp/widget.json";
import workMode from "src/config/workMode.json";
export const storedLanguage = localStorage.getItem("language") || "fr";

const initI18n = () => {
  i18next.use(initReactI18next).init({
    lng: storedLanguage,
    debug: true,
    resources: {
      en: {
        translation,
        widget: widgetEN, // Custom namespaces
        hotkey: hotkeyEN,
        workMode: workMode.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr }),
          {}
        ),
      },
      es: {
        translation: translationES,
        widget: widgetES, // Custom namespaces
        hotkey: hotkeyES,
        workMode: workMode.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr }),
          {}
        ),
      },
      fr: {
        translation: translationFR,
        widget: widgetFR, // Custom namespaces
        hotkey: hotkeyFR,
        workMode: workMode.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr }),
          {}
        ),
      },
      de: {
        translation: translationDE,
        widget: widgetDE, // Custom namespaces
        hotkey: hotkeyDE,
        workMode: workMode.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr }),
          {}
        ),
      },
      it: {
        translation: translationIT,
        widget: widgetIT, // Custom namespaces
        hotkey: hotkeyIT,
        workMode: workMode.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr }),
          {}
        ),
      },
      jp: {
        translation: translationJP,
        widget: widgetJP, // Custom namespaces
        hotkey: hotkeyJP,
        workMode: workMode.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr }),
          {}
        ),
      },
      fallbackLng: "en",
      ns: ["translation", "widget", "hotkey", "workMode"], // Namespaces
      defaultNS: "translation",
      interpolation: {
        escapeValue: false,
      },
    },
    // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
    // set returnNull to false (and also in the i18next.d.ts options)
    // returnNull: false,
  });
};
export function changeLanguage(newLanguage: any) {
  i18next.changeLanguage(newLanguage);
  localStorage.setItem("language", newLanguage);
}

export default initI18n;
