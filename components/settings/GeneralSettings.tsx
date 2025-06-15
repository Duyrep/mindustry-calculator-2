"use client"

import { useContext } from "react";
import CustomDetails from "../CustomDetails";
import { SettingsContext } from "@/context/SettingsContext";
import { GameModeEnum } from "@/types/data/vanilla-7.0";
import { useTranslation } from "react-i18next";

export default function GeneralSettings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useContext(SettingsContext).settingsState

  return (
    <CustomDetails
      summary={t("General")}
      className="rounded-t-md transition-all duration-200"
      onChange={(open, target) => {
        if (open) {
          target.classList.add("mb-2")
        } else {
          target.classList.remove("mb-2")
        }
      }}
    >
      <table className="border-separate border-spacing-2">
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-right">{t("Language")}: </td>
            <td>
              <select
                className="outline-none cursor-pointer"
                defaultValue={settings.lang}
                onChange={(event) => {
                  const target = event.target as HTMLSelectElement
                  setSettings(prev => ({ ...prev, lang: target.value }))
                }}
              >
                {Object.entries({
                  "en": "English",
                  "vi": "Tiếng Việt"
                }).map(([lang, display]) => (
                  <option
                    key={lang} value={lang}
                    className="bg-surface-a10"
                  >{display}</option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className="text-left">{t("Display rates as")}:</td>
            <td>
              <div className="flex flex-wrap gap-2">
                {["second", "minute", "hour"].map((rate) => (
                  <div
                    key={rate}
                    className={`select-none rounded-md p-1 px-2 cursor-pointer duration-100 ${rate == settings.displayRate ? "bg-primary" : "bg-surface-a20"}`}
                    onClick={() => setSettings(prev => ({ ...prev, displayRate: rate }))}
                  >{t(rate)}</div>
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td className="text-right">{t("Game mode")}:</td>
            <td>
              <div className="flex flex-wrap gap-2">
                {Object.values(GameModeEnum).map((mode) => (
                  <div
                    key={mode}
                    className={`p-1 px-2 rounded-md duration-100 cursor-pointer ${settings.gameMode == mode ? "bg-primary" : "bg-surface-a20"}`}
                    onClick={() => setSettings(prev => ({ ...prev, gameMode: mode }))}
                  >{mode}</div>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </CustomDetails>
  )
}
