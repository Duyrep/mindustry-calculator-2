"use client"

import CustomDetails from "@/components/CustomDetails";
import CustomImage from "@/components/CustomImage";
import InputTarget from "@/components/InputTarget";
import { SettingsContext } from "@/context/SettingsContext";
import { TargetContext } from "@/context/TargetContext";
import { calculateFactoryRequirements, FactoryRequirementsResult } from "@/types/calculations/factory";
import { getBeaconByBuilding } from "@/types/utils";
import { useContext, useEffect, useState } from "react";

export default function Factory() {
  const settings = useContext(SettingsContext).settingsState[0];
  const target = useContext(TargetContext).target;
  const productsPerSec = useContext(TargetContext).productsPerSec
  const [result, setResult] = useState<FactoryRequirementsResult>({ result: [], totalEnergyUsage: 0 })
  const [boostVisibility, setBoostVisibility] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const boostVisibility: Record<string, boolean> = {};
    result.result.forEach(({ buildingName, productName }) => {
      const beacons = getBeaconByBuilding(buildingName, settings);
      if (beacons) {
        boostVisibility[productName] = false
      }
    })

    setBoostVisibility(boostVisibility);
  }, [])

  useEffect(() => {
    const result = calculateFactoryRequirements(target, productsPerSec, settings);
    setResult(result)
  }, [target, productsPerSec, settings]);

  useEffect(() => {
    console.log(boostVisibility)
  }, [boostVisibility])

  return (
    <>
      <InputTarget />
      <CustomDetails
        summary="Products"
        className="rounded-t-md transition-all duration-200"
        defaultOpen={true}
        onChange={(open, target) => {
          if (open) {
            target.classList.add("mb-2")
          } else {
            target.classList.remove("mb-2")
          }
        }}
      >
        <div className="px-1 pb-1">
          <table>
            <thead>
              <tr className="border-b border-surface-a30">
                {["Buildings", `Items/${settings.displayRate.charAt(0)}`, "Beacon", "Boosts"].map((value) => (
                  <th
                    key={value}
                    className="p-2"
                  >
                    {value}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.result.map(({ buildingName, numOfBuilding, productName, numOfProductsPerSec }, index) => {
                const beacons = getBeaconByBuilding(buildingName, settings);

                return (
                  <tr
                    key={index}
                    className="border-b border-surface-a30 text-xs"
                  >
                    <td>
                      <div className="flex items-center gap-1 p-2">
                        <CustomImage name={buildingName} />
                        x{+numOfBuilding.toFixed(1)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <CustomImage name={productName} />
                        x{+numOfProductsPerSec.toFixed(3)}
                      </div>
                    </td>
                    <td>
                      <div className="relative flex flex-wrap justify-center select-none">
                        <div
                          className="border border-surface-a20 rounded-md p-1 cursor-pointer"
                          onClick={() => setBoostVisibility(prev => ({ ...prev, [productName]: !prev[productName] }))}
                        >
                          <div className="flex items-center w-[32px] h-[32px]">None</div>
                          {/* <CustomImage name="" /> */}
                        </div>
                        <div className={`absolute top-11 flex flex-wrap ${!boostVisibility[productName] && "hidden"}`}>
                          {beacons && beacons.map((beaconName) => (
                            <div
                              key={beaconName}
                            >
                              <CustomImage name={beaconName} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CustomDetails>
      <CustomDetails
        summary="Power"
        className="border-surface-a30 transition-all duration-200 rounded-b-md"
        defaultOpen={true}
        onChange={(open, target) => {
          if (open) {
            target.classList.add("mt-2")
            target.classList.remove("border-t")
          } else {
            target.classList.add("border-t")
            target.classList.remove("mt-2")
          }
        }}
      >
        <div className="px-1 pb-1">
          <table>
            <thead>
              <tr>
                <th className="p-2">Buildings</th>
                <th className="p-2">Power</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-right"><b>Total power:</b></td>
                <td>&nbsp;&nbsp;{result.totalEnergyUsage}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CustomDetails>
    </ >
  );
}
