import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Vietnamese from "./locales/vi.json";

const resources = {
  vi: {
    translation: Vietnamese,
  },
};

i18n.use(initReactI18next).init({
  resources: resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
