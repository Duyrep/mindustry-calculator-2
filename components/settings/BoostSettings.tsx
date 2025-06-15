"use client";

import {
  BuildingEnum,
  ExtractorEnum,
  ExtractorType,
  GameModeEnum,
  ResourceEnum,
} from "@/types/data/vanilla-7.0";
import CustomDetails from "../CustomDetails";
import { getBuilding, getResource } from "@/types/utils";
import CustomImage from "../CustomImage";
import { useContext } from "react";
import { SettingsContext } from "@/context/SettingsContext";

export default function BoostSettings() {
  const [settings, setSettings] = useContext(SettingsContext).settingsState;

  return (
    <CustomDetails
      summary="Boost"
      className="border-t border-surface-a30 transition-all duration-200"
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
      <div>
        <table className="border-spacing-1 border-separate">
          <thead>
            <tr>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(
              Object.fromEntries(
                Object.values(ExtractorEnum)
                  .map((extractorName) => {
                    const extractor = getBuilding(
                      extractorName
                    ) as ExtractorType;
                    if (!extractor) return;
                    if (!extractor.booster) return;
                    if (Object.keys(extractor.booster).length == 0) return;
                    if (!extractor.inGameModes.includes(settings.gameMode) && settings.gameMode !== GameModeEnum.Any) return;

                    return [
                      extractorName,
                      extractor.booster as Record<
                        ResourceEnum,
                        {
                          perSec: number;
                          speed: number;
                        }
                      >,
                    ];
                  })
                  .filter((value) => value !== undefined)
              )
            ).map(([extractorName, boost]) => (
              <tr key={extractorName}>
                <td>
                  <div className="flex items-center gap-1">
                    <CustomImage name={extractorName} />
                    <span>:</span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {[
                      [undefined, undefined],
                      ...Object.entries(
                        boost as Record<
                          ResourceEnum,
                          { perSec: number; speed: number }
                        >
                      ),
                    ].map(([resourceName, property], idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded-md cursor-pointer select-none transition-colors ${
                          Object.values(ResourceEnum)
                            .map((resourceName1) => {
                              const resource = getResource(resourceName1);
                              if (!resource) return;

                              if (
                                resource.producedBy.includes(
                                  extractorName as BuildingEnum
                                ) &&
                                settings.gameSettings[settings.gameMode].boosts[
                                  resourceName1
                                ]?.[extractorName] != resourceName
                              )
                                return null;

                              return settings.gameSettings[settings.gameMode]
                                .boosts[resourceName1]?.[extractorName];
                            })
                            .filter((value) => value !== undefined)
                            .every((value) => value === resourceName)
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
                                boosts: Object.fromEntries(
                                  Object.entries(
                                    Object.fromEntries(
                                      Object.values(ResourceEnum)
                                        .map((resourceName1) => {
                                          const resource =
                                            getResource(resourceName1);
                                          if (!resource) return;

                                          if (
                                            !resource.producedBy.includes(
                                              extractorName as BuildingEnum
                                            )
                                          )
                                            return;

                                          return [
                                            resourceName1,
                                            {
                                              [extractorName]: resourceName,
                                            },
                                          ];
                                        })
                                        .filter((value) => value != undefined)
                                    )
                                  ).map(([key, value]) => [
                                    key,
                                    {
                                      ...prev.gameSettings[prev.gameMode]
                                        .boosts[key],
                                      ...(value ?? {}),
                                    },
                                  ])
                                ),
                              },
                            },
                          }))
                        }
                      >
                        {resourceName && property ? (
                          <div
                            key={resourceName}
                            className="flex flex-col items-center"
                          >
                            <CustomImage name={resourceName} />
                            <span>x{property.speed}</span>
                          </div>
                        ) : (
                          <div
                            key={`none-${idx}`}
                            className="flex items-center h-full"
                          >
                            <div className="flex items-center text-center w-8 h-8">
                              <span>None</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CustomDetails>
  );
}
