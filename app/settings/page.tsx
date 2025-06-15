"use client";

import { rippleEffect } from "@/components/RippleEffect";
import BeaconSettings from "@/components/settings/BeaconSettings";
import BoostSettings from "@/components/settings/BoostSettings";
import GeneralSettings from "@/components/settings/GeneralSettings";
import MaterialSettings from "@/components/settings/RescourceSettings";
import { SettingsContext } from "@/context/SettingsContext";
import { getDefaultSettings } from "@/types/utils";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();
  const setSettings = useContext(SettingsContext).settingsState[1];

  return (
    <div className="transition-all duration-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs">{t("Game version")}: V7</span>
        <button
          className="bg-primary rounded-md py-1 px-2 cursor-pointer outline-none overflow-hidden relative"
          onClick={(event) => {
            rippleEffect(event);
            setSettings(getDefaultSettings());
          }}
        >
          {t("Reset")}
        </button>
      </div>
      <GeneralSettings />
      <MaterialSettings />
      {/* <BoostSettings /> */}
      <BeaconSettings />
    </div>
  );
}
