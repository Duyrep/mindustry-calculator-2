"use client";

import i18n from "@/i18n/i18n";
import { SettingsType } from "@/types/types";
import { getDefaultSettings } from "@/types/utils";
import { createContext, useEffect, useState } from "react";

type SettingsContextType = {
  themeState: [
    "light" | "dark",
    React.Dispatch<React.SetStateAction<"light" | "dark">>
  ];
  settingsState: [
    SettingsType,
    React.Dispatch<React.SetStateAction<SettingsType>>
  ];
};

export const SettingsContext = createContext<SettingsContextType>(
  {} as unknown as SettingsContextType
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [settings, setSettings] = useState(getDefaultSettings());

  useEffect(() => {
    setTheme((localStorage.getItem("theme") as "light" | "dark") ?? "dark");
    setSettings((prev) => ({
      ...prev,
      lang: localStorage.getItem("lang") ?? "en",
    }));
    if (!localStorage.getItem("lang")) {
      localStorage.setItem("lang", "en");
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "dark");
    if (theme == "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    console.log(settings);
    localStorage.setItem("lang", settings.lang);
    i18n.changeLanguage(settings.lang);
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        themeState: [theme, setTheme],
        settingsState: [settings, setSettings],
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
