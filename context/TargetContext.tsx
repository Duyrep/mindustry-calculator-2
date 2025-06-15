"use client"

import { ItemEnum } from "@/types/data/vanilla-v8";
import { calculateProductsPerSec } from "@/types/utils";
import { createContext, useContext, useState } from "react";
import { SettingsContext } from "./SettingsContext";

type TargetContextType = {
  target: ItemEnum;
  setTarget: React.Dispatch<React.SetStateAction<ItemEnum>>;
  numOfBuilding: number;
  setNUmOfBuilding: React.Dispatch<React.SetStateAction<number>>;
  calculationMode: "building" | "itemsPerTime";
  setCalculationMode: React.Dispatch<React.SetStateAction<"building" | "itemsPerTime">>;
  productsPerSec: number;
  setProductsPerSec: React.Dispatch<React.SetStateAction<number>>;
}

export const TargetContext = createContext<TargetContextType>({} as unknown as TargetContextType);

export function TargetProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<ItemEnum>(ItemEnum.Silicon);
  const [productsPerSec, setProductsPerSec] = useState(calculateProductsPerSec(target, 1, useContext(SettingsContext).settingsState[0]));
  const [numOfBuilding, setNumOfBuilding] = useState(1);
  const [calculationMode, setCalculationMode] = useState<"building" | "itemsPerTime">("building");

  return (
    <TargetContext.Provider value={{
      target: target, setTarget: setTarget,
      numOfBuilding: numOfBuilding, setNUmOfBuilding: setNumOfBuilding,
      calculationMode: calculationMode, setCalculationMode: setCalculationMode,
      productsPerSec: productsPerSec, setProductsPerSec: setProductsPerSec
    }}>
      {children}
    </TargetContext.Provider>
  )
}