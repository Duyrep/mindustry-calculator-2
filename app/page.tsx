"use client";

import CustomDetails from "@/components/CustomDetails";
import CustomImage from "@/components/CustomImage";
import InputTarget from "@/components/InputTarget";
import { SettingsContext } from "@/context/SettingsContext";
import { TargetContext } from "@/context/TargetContext";
import {
  calculateFactoryRequirements,
  FactoryRequirementsResult,
} from "@/types/calculations/factory";
import { ResourceEnum } from "@/types/data/vanilla-7.0";
import { getBeaconByBuilding } from "@/types/utils";
import { useContext, useEffect, useRef, useState } from "react";

export default function Factory() {
  const settings = useContext(SettingsContext).settingsState[0];
  const target = useContext(TargetContext).target;
  const productsPerSec = useContext(TargetContext).productsPerSec;
  const [result, setResult] = useState<FactoryRequirementsResult>({
    result: [],
    totalEnergyUsage: 0,
  });
  const [boostVisibility, setBoostVisibility] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const result = calculateFactoryRequirements(
      target,
      productsPerSec,
      settings
    );
    setResult(result);
  }, [target, productsPerSec, settings]);

  useEffect(() => {
    const boostVisibility: Record<string, boolean> = {};
    result.result.forEach(({ buildingName, productName }) => {
      const beacons = getBeaconByBuilding(buildingName, settings);
      if (beacons) {
        boostVisibility[productName] = false;
      }
    });

    setBoostVisibility(boostVisibility);
  }, []);

  return (
    <>
      <InputTarget />
      <CustomDetails
        summary="Products"
        className="rounded-t-md transition-all duration-200"
        defaultOpen={true}
        onChange={(open, target) => {
          if (open) {
            target.classList.add("mb-2");
          } else {
            target.classList.remove("mb-2");
          }
        }}
      >
        <div
          className="relative flex px-1 pb-1 overflow-x-auto"
          onScroll={() =>
            Object.keys(boostVisibility).map((productName) =>
              setBoostVisibility((prev) => ({ ...prev, [productName]: false }))
            )
          }
        >
          <table className="w-max h-max">
            <thead>
              <tr className="border-b border-surface-a30">
                {[
                  "Buildings",
                  `Items/${settings.displayRate.charAt(0)}`,
                  "Beacon",
                  "Boosts",
                ].map((value) => (
                  <th key={value} className="p-2">
                    {value}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.result.map(
                (
                  {
                    buildingName,
                    numOfBuilding,
                    productName,
                    numOfProductsPerSec,
                  },
                  index
                ) => {
                  return (
                    <tr
                      key={index}
                      className="border-b border-surface-a30 text-xs"
                    >
                      <Buildings
                        buildingName={buildingName}
                        numOfBuilding={numOfBuilding}
                      />
                      <Items
                        productName={productName}
                        numOfProductsPerSec={numOfProductsPerSec}
                      />
                      <Beacon
                        buildingName={buildingName}
                        productName={productName}
                        boostVisibility={boostVisibility}
                        setBoostVisibility={setBoostVisibility}
                      />
                    </tr>
                  );
                }
              )}
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
            target.classList.add("mt-2");
            target.classList.remove("border-t");
          } else {
            target.classList.add("border-t");
            target.classList.remove("mt-2");
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
                <td className="text-right">
                  <b>Total power:</b>
                </td>
                <td>&nbsp;&nbsp;{result.totalEnergyUsage}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CustomDetails>
    </>
  );
}

const Buildings = ({
  buildingName,
  numOfBuilding,
}: {
  buildingName: string;
  numOfBuilding: number;
}) => {
  return (
    <td>
      <div className="flex items-center gap-1 p-2 w-max">
        <CustomImage name={buildingName} />x{+numOfBuilding.toFixed(1)}
      </div>
    </td>
  );
};

const Items = ({
  productName,
  numOfProductsPerSec,
}: {
  productName: string;
  numOfProductsPerSec: number;
}) => {
  return (
    <td>
      <div className="flex items-center gap-1 w-max">
        <CustomImage name={productName} />x{+numOfProductsPerSec.toFixed(3)}
      </div>
    </td>
  );
};

const Beacon = ({
  buildingName,
  productName,
  boostVisibility,
  setBoostVisibility,
}: {
  buildingName: string;
  productName: string;
  boostVisibility: Record<string, boolean>;
  setBoostVisibility: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}) => {
  const settings = useContext(SettingsContext).settingsState[0];
  const beacons = getBeaconByBuilding(buildingName, settings);
  const dropdown = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLDivElement;
      if (dropdown.current && !dropdown.current.contains(target)) {
        setBoostVisibility((prev) => ({
          ...prev,
          [productName]: false,
        }));
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <td>
      <div ref={dropdown} className="flex flex-wrap justify-center select-none">
        <div
          className="border border-surface-a20 rounded-md p-1 cursor-pointer"
          onClick={() =>
            setBoostVisibility((prev) => ({
              ...prev,
              [productName]: !prev[productName],
            }))
          }
        >
          {settings.gameSettings[settings.gameMode].beacons[
            productName as ResourceEnum
          ] ? (
            <CustomImage
              name={
                settings.gameSettings[settings.gameMode].beacons[
                  productName as ResourceEnum
                ] ?? "OhNo"
              }
            />
          ) : (
            <div className="flex items-center w-[32px] h-[32px]">None</div>
          )}
        </div>
        <div
          className={`fixed bg-surface-a20 rounded-md z-10 mr-2 transition-all overflow-hidden ${
            !boostVisibility[productName] && "h-0"
          }`}
          style={{
            top: `${
              dropdown.current &&
              dropdown.current.getBoundingClientRect().y + 44
            }px`,
            left: `${
              dropdown.current &&
              dropdown.current.getBoundingClientRect().x + 14
            }px`,
          }}
        >
          <div className="p-1 flex flex-wrap gap-1">
            {beacons &&
              beacons.map((beaconName) => (
                <div key={beaconName} className="cursor-pointer">
                  <CustomImage name={beaconName} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </td>
  );
};
