"use client"

import { SettingsContext } from "@/context/SettingsContext"
import { TargetContext } from "@/context/TargetContext";
import { calculateNumOfBuilding, calculateProductsPerSec } from "@/types/utils";
import { useContext, useEffect, useRef } from "react"

export default function InputTarget() {
  const settings = useContext(SettingsContext).settingsState[0];
  const productTarget = useContext(TargetContext).target;
  const productsPerSec = useContext(TargetContext).productsPerSec;
  const setProductsPerSec = useContext(TargetContext).setProductsPerSec;

  const numOfBuildingRef = useRef<HTMLInputElement>(null);
  const numOfProductsPerSecRef = useRef<HTMLInputElement>(null);

  const numOfBuilding = useContext(TargetContext).numOfBuilding;
  const setNumOfBuilding = useContext(TargetContext).setNUmOfBuilding;
  const calculationMode = useContext(TargetContext).calculationMode;
  const setCalculationMode = useContext(TargetContext).setCalculationMode;

  useEffect(() => {
    if (numOfProductsPerSecRef.current && calculationMode == "building") {
      const productPerSec = calculateProductsPerSec(productTarget, numOfBuilding, settings)
      numOfProductsPerSecRef.current.value = +productPerSec.toFixed(3) + "";
      setProductsPerSec(productPerSec);
    }

    if (numOfBuildingRef.current && calculationMode == "itemsPerTime") {
      const numOfBuilding = calculateNumOfBuilding(productTarget, productsPerSec, settings)
      numOfBuildingRef.current.value = +numOfBuilding.toFixed(3) + "";
      setNumOfBuilding(numOfBuilding);
    }
  }, [productTarget]);

  return (
    <div className="flex flex-wrap items-center p-2 gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        <label
          htmlFor="numOfBuilding"
          className={`font-bold ${calculationMode !== "building" ? "font-normal" : ""}`}
        >Buildings:</label>
        <input
          ref={numOfBuildingRef}
          id="numOfBuilding"
          type="number"
          className="w-20 text-xs px-2 py-2"
          defaultValue={+numOfBuilding.toFixed(1) + ""}
          maxLength={100}
          onKeyDown={(event) => {
            if (event.key == "Enter") (event.target as HTMLInputElement).blur();
          }}
          onBlur={(event) => {
            const target = event.target as HTMLInputElement;
            if (target.value == +numOfBuilding.toFixed(1) + "") return;
            if ((target.value == "" || +target.value < 0) && numOfProductsPerSecRef.current) {
              target.value = "0";
              numOfProductsPerSecRef.current.value = "0"
              setProductsPerSec(0);
            }
            else if (numOfProductsPerSecRef.current) {
              const value = +target.value;
              target.value = value + "";

              const productPerSec = calculateProductsPerSec(productTarget, +value, settings);
              numOfProductsPerSecRef.current.value = +productPerSec.toFixed(3) + "";
              setProductsPerSec(productPerSec);
              setNumOfBuilding(value);
              setCalculationMode("building");
            }
            target.style.width = "80px";
            target.style.width = Math.max(target.scrollWidth, 80) + "px";
            if (numOfProductsPerSecRef.current) {
              numOfProductsPerSecRef.current.style.width = "80px";
              numOfProductsPerSecRef.current.style.width = Math.max(numOfProductsPerSecRef.current.scrollWidth, 80) + "px";
            }
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <label
          htmlFor="numOfResourcesPerTime"
          className={`font-bold ${calculationMode !== "itemsPerTime" ? "font-normal" : ""}`}
        >Items/{settings.displayRate}:</label>
        <input
          ref={numOfProductsPerSecRef}
          id="numOfResourcesPerTime"
          type="number"
          className="w-20 text-xs px-2 py-2"
          defaultValue={+productsPerSec.toFixed(3) + ""}
          maxLength={100}
          onKeyDown={(event) => {
            if (event.key == "Enter") (event.target as HTMLInputElement).blur()
          }}
          onBlur={(event) => {
            const target = event.target as HTMLInputElement;
            if (target.value == +productsPerSec.toFixed(3) + "") return;
            if ((target.value == "" || +target.value < 0) && numOfBuildingRef.current) {
              target.value = "0";
              numOfBuildingRef.current.value = "0"
              setProductsPerSec(0);
            }
            else if (numOfBuildingRef.current) {
              const value = +target.value
              target.value = value + "";

              const numOfBuilding = calculateNumOfBuilding(productTarget, +value, settings)
              numOfBuildingRef.current.value = +numOfBuilding.toFixed(1) + "";
              setNumOfBuilding(numOfBuilding);
              setProductsPerSec(value);
              setCalculationMode("itemsPerTime");
            }
            target.style.width = "80px";
            target.style.width = Math.max(target.scrollWidth, 80) + "px"
            if (numOfBuildingRef.current) {
              numOfBuildingRef.current.style.width = Math.max(numOfBuildingRef.current.scrollWidth, 80) + "px"
            }
          }}
        />
      </div>
    </div>
  )
}