"use client";

import { SettingsContext } from "@/context/SettingsContext";
import { TargetContext } from "@/context/TargetContext";
import { GameModeEnum } from "@/types/data/vanilla-7.0";
import {
  calculateNumOfBuilding,
  calculateProductsPerSec,
  getTimeUnitInSeconds,
} from "@/types/utils";
import { useContext, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function InputTarget() {
  const { t } = useTranslation();
  const [settings, setSettings] = useContext(SettingsContext).settingsState;
  const productTarget = useContext(TargetContext).target;
  const productsPerSec = useContext(TargetContext).productsPerSec;
  const setProductsPerSec = useContext(TargetContext).setProductsPerSec;
  const numOfBuilding = useContext(TargetContext).numOfBuilding;
  const setNumOfBuilding = useContext(TargetContext).setNUmOfBuilding;
  const calculationMode = useContext(TargetContext).calculationMode;
  const setCalculationMode = useContext(TargetContext).setCalculationMode;

  const numOfBuildingRef = useRef<HTMLInputElement>(null);
  const numOfProductsPerSecRef = useRef<HTMLInputElement>(null);

  const handleProductsPerSec = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    const target = event.target as HTMLInputElement;
    if (target.value == +productsPerSec.toFixed(3) + "") return;
    if ((target.value == "" || +target.value < 0) && numOfBuildingRef.current) {
      target.value = "0";
      numOfBuildingRef.current.value = "0";
      setProductsPerSec(0);
    } else if (numOfBuildingRef.current) {
      const value = +target.value;
      target.value = value + "";

      const numOfBuilding = calculateNumOfBuilding(
        productTarget,
        +value / getTimeUnitInSeconds(settings),
        settings
      ).numOfBuilding;
      numOfBuildingRef.current.value = +numOfBuilding.toFixed(1) + "";
      setNumOfBuilding(numOfBuilding);
      setProductsPerSec(value / getTimeUnitInSeconds(settings));
      setCalculationMode("itemsPerTime");
    }
    target.style.width = "80px";
    target.style.width = Math.max(target.scrollWidth, 80) + "px";
    if (numOfBuildingRef.current) {
      numOfBuildingRef.current.style.width =
        Math.max(numOfBuildingRef.current.scrollWidth, 80) + "px";
    }
  };

  const handleBuildings = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    const target = event.target as HTMLInputElement;
    if (target.value == +numOfBuilding.toFixed(1) + "") return;
    if (
      (target.value == "" || +target.value < 0) &&
      numOfProductsPerSecRef.current
    ) {
      target.value = "0";
      numOfProductsPerSecRef.current.value = "0";
      setProductsPerSec(0);
    } else if (numOfProductsPerSecRef.current) {
      const value = +target.value;
      target.value = value + "";

      const productPerSec = calculateProductsPerSec(
        productTarget,
        +value,
        settings
      );
      numOfProductsPerSecRef.current.value = +productPerSec.toFixed(3) + "";
      setProductsPerSec(productPerSec);
      setNumOfBuilding(value);
      setCalculationMode("building");
    }
    target.style.width = "80px";
    target.style.width = Math.max(target.scrollWidth, 80) + "px";
    if (numOfProductsPerSecRef.current) {
      numOfProductsPerSecRef.current.style.width = "80px";
      numOfProductsPerSecRef.current.style.width =
        Math.max(numOfProductsPerSecRef.current.scrollWidth, 80) + "px";
    }
  };

  useEffect(() => {
    if (numOfProductsPerSecRef.current && calculationMode == "building") {
      const productPerSec = calculateProductsPerSec(
        productTarget,
        numOfBuilding,
        settings
      );
      numOfProductsPerSecRef.current.value =
        +(productPerSec * getTimeUnitInSeconds(settings)).toFixed(3) + "";
      setProductsPerSec(productPerSec);
    }

    if (numOfBuildingRef.current && calculationMode == "itemsPerTime") {
      const numOfBuilding = calculateNumOfBuilding(
        productTarget,
        productsPerSec,
        settings
      ).numOfBuilding;
      numOfBuildingRef.current.value = +numOfBuilding.toFixed(3) + "";
      setNumOfBuilding(numOfBuilding);
    }
  }, [
    productTarget,
    numOfBuilding,
    productsPerSec,
    settings,
    calculationMode,
    setProductsPerSec,
    setNumOfBuilding,
  ]);

  useEffect(() => {
    if (numOfProductsPerSecRef.current && numOfBuildingRef.current) {
      numOfProductsPerSecRef.current.value = +productsPerSec.toFixed(3) + "";
      numOfBuildingRef.current.value = +numOfBuilding.toFixed(3) + "";
    }
  }, [productTarget, numOfBuilding]);

  return (
    <div className="flex flex-wrap items-center p-2 gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        <label
          htmlFor="numOfBuilding"
          className={`font-bold ${
            calculationMode !== "building" ? "font-normal" : ""
          }`}
        >
          {t("Buildings")}:
        </label>
        <input
          ref={numOfBuildingRef}
          id="numOfBuilding"
          type="number"
          className="w-20 text-xs px-2 py-2"
          defaultValue={+numOfBuilding.toFixed(1) + ""}
          maxLength={100}
          onKeyDown={(event) => {
            if (event.key == "Enter") handleBuildings(event);
          }}
          onBlur={handleBuildings}
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <label
          htmlFor="numOfResourcesPerTime"
          className={`font-bold ${
            calculationMode !== "itemsPerTime" ? "font-normal" : ""
          }`}
        >
          {t("Items")}/{t(settings.displayRate)}:
        </label>
        <input
          ref={numOfProductsPerSecRef}
          id="numOfResourcesPerTime"
          type="number"
          className="w-20 text-xs px-2 py-2"
          defaultValue={+productsPerSec.toFixed(3) + ""}
          maxLength={100}
          onKeyDown={(event) => {
            if (event.key == "Enter") handleProductsPerSec(event);
          }}
          onBlur={handleProductsPerSec}
        />
      </div>
      <div className="flex gap-2 border-l border-surface-a30 pl-2 max-xl:hidden">
        <div className="flex items-center gap-2">
          <span>{t("Display rates as")}:</span>
          <select
            className="outline-none cursor-pointer bg-surface-a20 p-1 px-2 rounded-md"
            defaultValue={settings.displayRate}
            onChange={(event) => {
              const target = event.target as HTMLSelectElement;
              setSettings((prev) => ({ ...prev, displayRate: target.value }));
            }}
          >
            {Object.entries({
              second: "second",
              minute: "minute",
              hour: "hour",
            }).map(([rate, display]) => (
              <option key={rate} value={rate} className="bg-surface-a10">
                {t(display)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>{t("Game mode")}:</span>
          <select
            className="outline-none cursor-pointer bg-surface-a20 p-1 px-2 rounded-md"
            defaultValue={settings.gameMode}
            onChange={(event) => {
              const target = event.target as HTMLSelectElement;
              setSettings((prev) => ({
                ...prev,
                gameMode: target.value as GameModeEnum,
              }));
            }}
          >
            {Object.values(GameModeEnum).map((mode) => (
              <option key={mode} value={mode} className="bg-surface-a10">
                {mode}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>{t("Language")}:</span>
          <select
            className="outline-none cursor-pointer bg-surface-a20 p-1 px-2 rounded-md"
            defaultValue={settings.lang}
            onChange={(event) => {
              const target = event.target as HTMLSelectElement;
              setSettings((prev) => ({ ...prev, lang: target.value }));
            }}
          >
            {Object.entries({
              en: "English",
              vi: "Tiếng Việt",
            }).map(([lang, display]) => (
              <option key={lang} value={lang} className="bg-surface-a10">
                {display}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
