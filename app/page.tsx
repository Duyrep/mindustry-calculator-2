"use client";

import CustomDetails from "@/components/CustomDetails";
import CustomImage from "@/components/CustomImage";
import Dialog from "@/components/Dialog";
import { SettingsContext } from "@/context/SettingsContext";
import { TargetContext } from "@/context/TargetContext";
import {
  calculateFactoryRequirements,
  FactoryRequirementsResult,
} from "@/types/calculations/factory";
import {
  BeaconEnum,
  FloorEnum,
  GameModeEnum,
  ItemEnum,
} from "@/types/data/vanilla-v8";
import {
  getAffinitiesByBuilding,
  getBeacon,
  getBoostersByBuilding,
  getBuilding,
  getItem,
  getTerrain,
  getTimeUnitInSeconds,
} from "@/types/utils";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Factory() {
  const { t } = useTranslation();
  const settings = useContext(SettingsContext).settingsState[0];
  const target = useContext(TargetContext).target;
  const productsPerSec = useContext(TargetContext).productsPerSec;
  const factoryTable = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<FactoryRequirementsResult>({
    result: {},
    energyUsage: {
      buildings: {},
      generated: 0,
      used: 0,
    },
  });

  useEffect(() => {
    const result = calculateFactoryRequirements(
      target,
      productsPerSec,
      settings
    );
    console.log(result);
    setResult(result);
  }, [target, productsPerSec, settings]);

  return (
    <>
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
        <div ref={factoryTable} className="flex px-1 pb-1 w-min">
          <table className="w-full h-max">
            <thead>
              <tr className="border-b border-surface-a30">
                {[
                  `${t("Items")}/${t(settings.displayRate).charAt(0)}`,
                  "Buildings",
                  "Beacons",
                ].map((value, idx) => (
                  <React.Fragment key={idx}>
                    {idx === 2 && (
                      <th>
                        <div className="flex flex-col text-sm w-max p-2">
                          <span>{t("Affinities")}</span>
                          <span>{t("Boosts")}</span>
                        </div>
                      </th>
                    )}
                    <th key={value}>
                      <div className="w-max p-2">{t(value)}</div>
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.result).map(
                ([productName, value], index) => {
                  if (!value) return null;
                  const { buildingName, numOfBuilding, numOfProductsPerSec } =
                    value;
                  return (
                    <tr
                      key={index}
                      className="border-b border-surface-a30 text-xs"
                    >
                      {factoryTable.current && (
                        <>
                          <Items
                            productName={productName}
                            numOfProductsPerSec={numOfProductsPerSec}
                          />
                          <Buildings
                            buildingName={buildingName}
                            productName={productName}
                            numOfBuilding={numOfBuilding}
                          />
                          <td>
                            <Boosts
                              buildingName={buildingName}
                              productName={productName}
                            />
                            <Affinities
                              buildingName={buildingName}
                              productName={productName}
                            />
                          </td>
                          <Beacons productName={productName} />
                        </>
                      )}
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
        <div className="flex justify-center">
          <div className="w-[40rem] flex justify-between text-xl gap-4 p-2">
            <div className="flex text-center w-full justify-center flex-col">
              <span>{+result.energyUsage.generated.toFixed(3)}</span>
              <span>{t("Generated")}</span>
            </div>
            <div className="flex items-center font-bold">-</div>
            <div className="flex text-center w-full justify-center flex-col">
              <span>{+result.energyUsage.used.toFixed(3)}</span>
              <span>{t("Used")}</span>
            </div>
            <div className="flex items-center font-bold">=</div>
            <div className="flex w-full text-center justify-center flex-col">
              <span>
                {
                  +(
                    result.energyUsage.generated - result.energyUsage.used
                  ).toFixed(3)
                }
              </span>
              <span>{t("Net")}</span>
            </div>
          </div>
        </div>
      </CustomDetails>
    </>
  );
}

const Buildings = ({
  buildingName,
  productName,
  numOfBuilding,
}: {
  buildingName: string;
  productName: string;
  numOfBuilding: number;
}) => {
  const [settings, setSettings] = useContext(SettingsContext).settingsState;
  const product = getItem(productName);
  const [show, setShow] = useState(false);

  if (!product)
    return (
      <td>
        <div className="flex items-center gap-1 p-3 w-max">
          <CustomImage name="oh no" />x{+numOfBuilding.toFixed(1)}
        </div>
      </td>
    );

  const producedBy = product.producedBy
    .map((buildingName) => {
      const building = getBuilding(buildingName);
      if (!building) return;
      if (
        !building.inGameModes.includes(settings.gameMode) &&
        settings.gameMode !== GameModeEnum.Any
      )
        return;
      return buildingName;
    })
    .filter((value) => value !== undefined);

  return (
    <td>
      {producedBy.length > 1 ? (
        <div className="p-2 flex items-center gap-1">
          <SelectionDialog image={buildingName} showState={[show, setShow]}>
            <div className="flex gap-1 flex-wrap">
              {product?.producedBy.map((producedByName, idx) => {
                const building = getBuilding(producedByName);
                if (!building) return;
                if (
                  !building.inGameModes.includes(settings.gameMode) &&
                  settings.gameMode !== GameModeEnum.Any
                )
                  return;

                return (
                  <button
                    key={idx}
                    className={`flex gap-1 items-center text-sm p-1 rounded-md ${
                      buildingName === producedByName
                        ? "bg-primary"
                        : "bg-surface-a20"
                    }`}
                    onClick={() => {
                      setShow(false);
                      setSettings((prev) => ({
                        ...prev,
                        gameSettings: {
                          ...prev.gameSettings,
                          [prev.gameMode]: {
                            ...prev.gameSettings[prev.gameMode],
                            items: {
                              ...prev.gameSettings[prev.gameMode].items,
                              [productName]: producedByName,
                            },
                          },
                        },
                      }));
                    }}
                  >
                    <CustomImage name={producedByName} />
                    <span>{producedByName}</span>
                  </button>
                );
              })}
            </div>
          </SelectionDialog>
          <span className="text-nowrap">
            x{numOfBuilding < 0.1 ? " <0.1" : +numOfBuilding.toFixed(1)}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 p-2 w-max">
          <div className="p-[5px]">
            <CustomImage name={buildingName} />
          </div>
          <span className="text-nowrap">
            x{numOfBuilding < 0.1 ? " <0.1" : +numOfBuilding.toFixed(1)}
          </span>
        </div>
      )}
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
  const settings = useContext(SettingsContext).settingsState[0];

  return (
    <td>
      <div className="flex items-center gap-1 w-max p-2">
        <CustomImage name={productName} />
        {+(numOfProductsPerSec * getTimeUnitInSeconds(settings)).toFixed(3)}
      </div>
    </td>
  );
};

const SelectionDialog = ({
  children,
  showState,
  image,
}: {
  children: React.ReactNode;
  showState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  image?: string;
}) => {
  const [internalShow, setInternalShow] = useState(false);

  const [show, setShow] = showState ?? [internalShow, setInternalShow];

  return (
    <div className="flex justify-center">
      <div
        className="border border-surface-a20 rounded-md p-1 cursor-pointer hover:border-primary transition-colors"
        onClick={() => setShow(!show)}
      >
        <div className="flex rounded-md items-center w-8 h-8 select-none">
          {image ? (
            image == "Other" ? (
              "Other"
            ) : (
              <CustomImage name={image} />
            )
          ) : (
            "None"
          )}
        </div>
      </div>
      <Dialog showState={[show, setShow]}>{children}</Dialog>
    </div>
  );
};

const Beacons = ({ productName }: { productName: string }) => {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useContext(SettingsContext).settingsState;

  return (
    <td>
      <SelectionDialog
        showState={[show, setShow]}
        image={
          settings.gameSettings[settings.gameMode].beacons[
            productName as ItemEnum
          ]
        }
      >
        <div className="p-1 flex flex-wrap gap-1">
          {[undefined, ...Object.keys(BeaconEnum)].map((beaconName, idx) => (
            <div
              key={beaconName ?? `none-${idx}`}
              className={`cursor-pointer p-1 rounded-md ${
                beaconName ==
                settings.gameSettings[settings.gameMode].beacons[
                  productName as ItemEnum
                ]
                  ? "bg-primary"
                  : "bg-surface-a20"
              }`}
              onClick={() => {
                setShow(false);
                setSettings((prev) => {
                  const newSettings = { ...prev };
                  if (
                    settings.gameSettings[settings.gameMode].beacons[
                      productName as ItemEnum
                    ] == beaconName
                  ) {
                    delete newSettings.gameSettings[prev.gameMode].beacons[
                      productName as ItemEnum
                    ];
                  } else {
                    newSettings.gameSettings[prev.gameMode].beacons[
                      productName as ItemEnum
                    ] = beaconName as BeaconEnum;
                  }
                  return newSettings;
                });
              }}
            >
              {beaconName ? (
                <div className="flex gap-1 items-center text-sm">
                  <CustomImage key={beaconName} name={beaconName} />
                  <span>{beaconName}</span>
                  <span>
                    ({formatPercentage(getBeacon(beaconName).speedIncrease)})
                  </span>
                </div>
              ) : (
                <div
                  key={`none-${idx}`}
                  className="flex items-center justify-center w-8 min-h-8 h-full select-none"
                >
                  None
                </div>
              )}
            </div>
          ))}
        </div>
      </SelectionDialog>
    </td>
  );
};

const Boosts = ({
  buildingName,
  productName,
}: {
  buildingName: string;
  productName: string;
}) => {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useContext(SettingsContext).settingsState;
  const boosts = getBoostersByBuilding(buildingName);

  return (
    <>
      {boosts && (
        <SelectionDialog
          showState={[show, setShow]}
          image={
            settings.gameSettings[settings.gameMode].boosts[productName]?.[
              buildingName
            ]
          }
        >
          <div className="flex flex-wrap gap-1 p-1">
            {[undefined, ...Object.keys(boosts)].map((resourceName, idx) => (
              <React.Fragment key={idx}>
                <div
                  className={`cursor-pointer p-1 rounded-md ${
                    settings.gameSettings[settings.gameMode].boosts[
                      productName
                    ]?.[buildingName] == resourceName
                      ? "bg-primary"
                      : "bg-surface-a20"
                  }`}
                  onClick={() => {
                    setShow(false);
                    setSettings((prev) => ({
                      ...prev,
                      gameSettings: {
                        ...prev.gameSettings,
                        [prev.gameMode]: {
                          ...prev.gameSettings[prev.gameMode],
                          boosts: {
                            ...prev.gameSettings[prev.gameMode].boosts,
                            [productName]: {
                              ...prev.gameSettings[prev.gameMode].boosts[
                                productName
                              ],
                              [buildingName]: resourceName,
                            },
                          },
                        },
                      },
                    }));
                  }}
                >
                  {resourceName ? (
                    <div className="flex items-center gap-1 text-sm">
                      <CustomImage key={resourceName} name={resourceName} />
                      <span>{resourceName}</span>
                      <span>
                        (x{boosts[resourceName as ItemEnum]?.speedBoost})
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        key={`none-${idx}`}
                        className="flex items-center justify-center w-8 min-h-8 h-full select-none"
                      >
                        None
                      </div>
                    </>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </SelectionDialog>
      )}
    </>
  );
};

const Affinities = ({
  buildingName,
  productName,
}: {
  buildingName: string;
  productName: string;
}) => {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useContext(SettingsContext).settingsState;
  const affinities = getAffinitiesByBuilding(buildingName);

  return (
    <>
      {affinities && (
        <SelectionDialog
          showState={[show, setShow]}
          image={
            settings.gameSettings[settings.gameMode].affinities[productName]?.[
              buildingName
            ]
          }
        >
          <div className="flex flex-wrap gap-1">
            {Object.keys(affinities).map((terrainName, idx) => {
              const terrain = getTerrain(terrainName);
              if (!terrain && terrainName !== undefined) return;

              return (
                <div
                  key={idx}
                  className={`flex justify-center items-center p-1 rounded-md cursor-pointer transition-colors ${
                    settings.gameSettings[settings.gameMode].affinities[
                      productName
                    ]?.[buildingName] === terrainName
                      ? "bg-primary"
                      : "bg-surface-a20"
                  }`}
                  onClick={() => {
                    setShow(false);
                    setSettings((prev) => ({
                      ...prev,
                      gameSettings: {
                        ...prev.gameSettings,
                        [prev.gameMode]: {
                          ...prev.gameSettings[prev.gameMode],
                          affinities: {
                            ...prev.gameSettings[prev.gameMode].affinities,
                            [productName]: {
                              ...prev.gameSettings[prev.gameMode].affinities[
                                productName
                              ],
                              [buildingName]: terrainName,
                            },
                          },
                        },
                      },
                    }));
                  }}
                >
                  {terrainName != "Other" ? (
                    <div className="flex gap-1 items-center text-sm">
                      <CustomImage name={terrainName} />
                      <span>{terrainName}</span>
                      <span>
                        (
                        {affinities[terrainName as FloorEnum]?.affinity
                          ? (affinities[terrainName as FloorEnum]?.affinity ??
                              0) *
                              100 +
                            "%"
                          : formatPercentage(
                              affinities[terrainName as FloorEnum]
                                ?.efficiency ?? 0
                            )}
                        )
                      </span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center select-none">
                      Other
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SelectionDialog>
      )}
    </>
  );
};

const formatPercentage = (number: number) => {
  return `${number * 100 > 0 ? "+" : ""}${number * 100}%`;
};
