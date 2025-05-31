"use client";

import { SettingsContext } from "@/context/SettingsContext";
import { useContext } from "react";
import CustomDetails from "../CustomDetails";
import { BeaconEnum, ResourceEnum } from "@/types/data/vanilla-7.0";
import CustomImage from "../CustomImage";
import { getBeacon } from "@/types/utils";

export default function BeaconSettings() {
  const [settings, setSettings] = useContext(SettingsContext).settingsState;

  return (
    <CustomDetails
      summary="Beacon"
      className="border-t border-surface-a30 transition-all duration-200 rounded-b"
      onChange={(open, target) => {
        if (open) {
          target.classList.add("my-2");
          target.classList.remove("border-t");
        } else {
          target.classList.add("border-t");
          target.classList.remove("my-2");
        }
      }}
    >
      <div className="p-1 flex gap-2">
        {[undefined, ...Object.values(BeaconEnum)].map((beaconName, idx) => {
          return (
            <div
              key={idx}
              className={`flex flex-col gap-1 p-1 rounded-md text-xs cursor-pointer duration-100 select-none ${
                settings.gameSettings[settings.gameMode]
              } ${
                Object.values(
                  settings.gameSettings[settings.gameMode].beacons
                ).every((value) => value === beaconName) 
                  ? "bg-primary"
                  : "bg-surface-a20"
              }`}
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  gameSettings: {
                    ...prev.gameSettings,
                    [prev.gameMode]: {
                      ...prev.gameSettings[prev.gameMode],
                      beacons:  Object.fromEntries(
                              Object.keys(ResourceEnum).map((key) => [
                                key,
                                beaconName,
                              ])
                            ),
                    },
                  },
                }))
              }
            >
              {beaconName ? (
                <div key={beaconName} className="flex flex-col items-center justify-center">
                  <CustomImage name={beaconName} />
                  <span>+{getBeacon(beaconName)?.distributionEffectivity ?? 0 * 100}%</span>
                </div>
              ) : (
                <div
                  key={`none-${idx}`}
                  className="flex items-center justify-center w-8 h-full"
                >
                  None
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CustomDetails>
  );
}
