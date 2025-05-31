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
import { BeaconEnum, FloorsEnum, ResourceEnum } from "@/types/data/vanilla-7.0";
import {
  getAffinitiesByBuilding,
  getBeaconByBuilding,
  getBoostersByBuilding,
} from "@/types/utils";
import { useContext, useEffect, useRef, useState } from "react";

export default function Factory() {
  const settings = useContext(SettingsContext).settingsState[0];
  const target = useContext(TargetContext).target;
  const productsPerSec = useContext(TargetContext).productsPerSec;
  const factoryTable = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<FactoryRequirementsResult>({
    result: [],
    totalEnergyUsage: 0,
  });

  useEffect(() => {
    const result = calculateFactoryRequirements(
      target,
      productsPerSec,
      settings
    );
    setResult(result);
  }, [target, productsPerSec, settings]);

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
          ref={factoryTable}
          className="relative flex px-1 pb-1 overflow-x-auto"
        >
          <table className="w-max h-max</div>">
            <thead>
              <tr className="border-b border-surface-a30">
                {[
                  "Buildings",
                  `Items/${settings.displayRate.charAt(0)}`,
                  "Affinities",
                  "Boosts",
                  "Beacons",
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
                      {factoryTable.current && (
                        <>
                          <Buildings
                            buildingName={buildingName}
                            numOfBuilding={numOfBuilding}
                          />
                          <Items
                            productName={productName}
                            numOfProductsPerSec={numOfProductsPerSec}
                          />
                          <Affinities
                            factoryTable={factoryTable.current}
                            buildingName={buildingName}
                            productName={productName}
                          />
                          <Boosts
                            factoryTable={factoryTable.current}
                            buildingName={buildingName}
                            productName={productName}
                          />
                          <Beacons
                            factoryTable={factoryTable.current}
                            buildingName={buildingName}
                            productName={productName}
                          />
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

const Dropdown = ({
  children,
  factoryTable,
  image,
}: {
  children: React.ReactNode;
  factoryTable: HTMLDivElement;
  image?: string;
}) => {
  const [show, setShow] = useState(false);
  const button = useRef<HTMLDivElement | null>(null);
  const dropdown = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateDropdown = () => {
      if (dropdown.current && button.current) {
        const rect = button.current.getBoundingClientRect();

        dropdown.current.style.top = rect.y + rect.height + "px";
        dropdown.current.style.left = rect.x + "px";
        dropdown.current.style.transition = "none";
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (
        button.current &&
        !button.current.contains(event.target as HTMLDivElement)
      ) {
        setShow(false);
      }
    };

    const handleWindowScroll = () => updateDropdown()
    const handleScroll = () => updateDropdown()

    window.addEventListener("scroll", handleWindowScroll);
    factoryTable.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClick);

    return () => {
      window.addEventListener("scroll", handleWindowScroll);
      factoryTable.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="flex justify-center">
      <div
        ref={button}
        className="border border-surface-a20 rounded-md p-1 cursor-pointer hover:border-primary transition-colors"
        onClick={() => setShow(!show)}
      >
        <div className="flex rounded-md items-center w-8 h-8 select-none">
          {image ? <CustomImage name={image} /> : "None"}
        </div>
      </div>
      {button.current && (
        <div
          ref={dropdown}
          className={`fixed overflow-hidden transition-all z-10 ${
            !show && "h-0"
          } mr-2`}
          style={{
            top:
              button.current.getBoundingClientRect().y +
              button.current.getBoundingClientRect().height +
              "px",
            left: button.current.getBoundingClientRect().x + "px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const Beacons = ({
  buildingName,
  productName,
  factoryTable,
}: {
  factoryTable: HTMLDivElement;
  buildingName: string;
  productName: string;
}) => {
  const [settings, setSettings] = useContext(SettingsContext).settingsState;
  const beacons = getBeaconByBuilding(buildingName, settings);

  return (
    <td>
      <Dropdown
        image={
          settings.gameSettings[settings.gameMode].beacons[
            productName as ResourceEnum
          ]
        }
        factoryTable={factoryTable}
      >
        <div className="p-1 border border-surface-a30 bg-surface-a20 rounded-md inline-flex flex-wrap gap-1">
          {beacons &&
            [undefined, ...Object.keys(beacons)].map((beaconName, idx) => (
              <div
                key={beaconName ?? `none-${idx}`}
                className={`cursor-pointer p-1 rounded-md ${
                  beaconName ==
                  settings.gameSettings[settings.gameMode].beacons[
                    productName as ResourceEnum
                  ]
                    ? "bg-primary"
                    : "bg-surface-a10"
                }`}
                onClick={() => {
                  setSettings((prev) => {
                    const newSettings = { ...prev };
                    if (
                      settings.gameSettings[settings.gameMode].beacons[
                        productName as ResourceEnum
                      ] == beaconName
                    ) {
                      delete newSettings.gameSettings[prev.gameMode].beacons[
                        productName as ResourceEnum
                      ];
                    } else {
                      newSettings.gameSettings[prev.gameMode].beacons[
                        productName as ResourceEnum
                      ] = beaconName as BeaconEnum;
                    }
                    return newSettings;
                  });
                }}
              >
                {beaconName ? (
                  <div className="flex flex-col items-center">
                    <CustomImage key={beaconName} name={beaconName} />
                    <span>{formatPercentage(beacons[beaconName])}</span>
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
      </Dropdown>
    </td>
  );
};

const Boosts = ({
  buildingName,
  productName,
  factoryTable,
}: {
  factoryTable: HTMLDivElement;
  buildingName: string;
  productName: string;
}) => {
  const [settings, setSettings] = useContext(SettingsContext).settingsState;
  const boosts = getBoostersByBuilding(buildingName);

  return (
    <td>
      {boosts && (
        <Dropdown
          image={
            settings.gameSettings[settings.gameMode].boosts[productName]?.[
              buildingName
            ]
          }
          factoryTable={factoryTable}
        >
          <div className="flex flex-wrap gap-1 p-1 bg-surface-a20 rounded-md border border-surface-a30">
            {[undefined, ...Object.keys(boosts)].map((resourceName, idx) => (
              <div
                key={idx}
                className={`cursor-pointer p-1 rounded-md ${
                  settings.gameSettings[settings.gameMode].boosts[
                    productName
                  ]?.[buildingName] == resourceName
                    ? "bg-primary"
                    : "bg-surface-a10"
                }`}
                onClick={() =>
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
                  }))
                }
              >
                {resourceName ? (
                  <div className="flex flex-col items-center">
                    <CustomImage key={resourceName} name={resourceName} />
                    <span>x{boosts[resourceName as ResourceEnum].speed}</span>
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
        </Dropdown>
      )}
    </td>
  );
};

const Affinities = ({
  buildingName,
  productName,
  factoryTable,
}: {
  factoryTable: HTMLDivElement;
  buildingName: string;
  productName: string;
}) => {
  const [settings, setSettings] = useContext(SettingsContext).settingsState;
  const affinities = getAffinitiesByBuilding(buildingName);

  return (
    <td>
      {affinities && (
        <Dropdown
          factoryTable={factoryTable}
          image={
            settings.gameSettings[settings.gameMode].affinities[productName]?.[
              buildingName
            ]
          }
        >
          <div className="flex flex-wrap gap-1 bg-surface-a20 rounded-md p-1">
            {[undefined, ...Object.keys(affinities)].map((floorName, idx) => (
              <div
                key={idx}
                className="flex justify-center items-center p-1 bg-surface-a10 rounded-md cursor-pointer"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    gameSettings: {
                      ...prev.gameSettings,
                      [prev.gameMode]: {
                        ...prev.gameSettings[prev.gameMode],
                        affinities: {
                          [productName]: {
                            ...prev.gameSettings[prev.gameMode].affinities[
                              productName
                            ],
                            [buildingName]: floorName,
                          },
                        },
                      },
                    },
                  }))
                }
              >
                {floorName ? (
                  <div className="flex flex-col items-center justify-center select-none">
                    <CustomImage name={floorName} />
                    <span>
                      {affinities[floorName as FloorsEnum]?.efficiency
                        ? affinities[floorName as FloorsEnum]?.efficiency
                        : formatPercentage(
                            affinities[floorName as FloorsEnum]?.affinity ?? 0
                          )}
                    </span>
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center select-none">
                    None
                  </div>
                )}
              </div>
            ))}
          </div>
        </Dropdown>
      )}
    </td>
  );
};

const formatPercentage = (number: number) => {
  return `${number * 100 > 0 ? "+" : ""}${number * 100}%`;
};
