import {
  BeaconEnum,
  BeaconType,
  BuildingEnum,
  data,
  ExtractorEnum,
  ExtractorType,
  FactoryEnum,
  FactoryType,
  FloorEnum,
  GameModeEnum,
  ResourceEnum,
  ResourceType,
  TerrainEnum,
  UnitBuildingEnum,
  UnitBuildingType,
  UnitEnum,
  UnitType,
  WallsEnum,
} from "./data/vanilla-7.0";
import { GameSettingsType, SettingsType } from "./types";

export function getDefaultSettings(): SettingsType {
  const gameSettings = {} as Record<GameModeEnum, GameSettingsType>;
  Object.values(GameModeEnum).forEach((gameMode) => {
    gameSettings[gameMode] = getDefaultGameSettings(gameMode);
  });

  return {
    theme: "dark",
    lang: "en",
    displayRate: "second",
    graphDirection: "TB",

    gameMode: GameModeEnum.Serpulo,
    gameSettings: gameSettings,
  };
}

function getDefaultGameSettings(gameMode: GameModeEnum): GameSettingsType {
  const resources = {} as Partial<Record<ResourceEnum | string, BuildingEnum>>;
  const affinities = {} as Partial<
    Record<
      ResourceEnum | string,
      Record<BuildingEnum | string, FloorEnum | string>
    >
  >;
  [...Object.values(UnitEnum), ...Object.values(ResourceEnum)].forEach(
    (gameObjectName) => {
      const gameObject = getGameObject(gameObjectName);
      if (
        gameObject &&
        (gameObject.inGameModes.includes(gameMode) ||
          gameMode === GameModeEnum.Any) &&
        gameObject.producedBy.length > 1
      ) {
        gameObject.producedBy.forEach((buildingName) => {
          const building = getBuilding(buildingName) as ExtractorType;
          if (
            building &&
            (building.inGameModes.includes(gameMode) ||
              gameMode === GameModeEnum.Any) &&
            !resources[gameObjectName]
          ) {
            resources[gameObjectName] = buildingName;
          }
          if (
            building &&
            building.affinities &&
            building.inGameModes.includes(gameMode)
          ) {
            affinities[gameObjectName] = {
              [buildingName]: Object.keys(building.affinities)[0],
            };
          }
        });
      }
    }
  );

  return {
    resources: resources,
    beacons: Object.fromEntries(
      Object.keys(ResourceEnum).map((key) => [key, undefined])
    ),
    boosts: {},
    affinities: affinities,
  };
}

export function getTimeUnitInSeconds(settings: SettingsType) {
  return settings.displayRate == "minute"
    ? 60
    : settings.displayRate == "hour"
    ? 3600
    : 1;
}

export function getGameObject(name: string): ResourceType | UnitType | null {
  const resource = getResource(name);
  if (resource) return resource;
  const unit = getUnit(name);
  if (unit) return unit;
  return null;
}

export function getBuilding(
  name: string | undefined
): ExtractorType | FactoryType | UnitBuildingType | null {
  if (Object.values(ExtractorEnum).includes(name as ExtractorEnum)) {
    return data.extractors[name as ExtractorEnum];
  } else if (Object.values(FactoryEnum).includes(name as FactoryEnum)) {
    return data.factories[name as FactoryEnum];
  } else if (
    Object.values(UnitBuildingEnum).includes(name as UnitBuildingEnum)
  ) {
    return data.unitBuildings[name as UnitBuildingEnum];
  }
  return null;
}

export function getBeacon(name: string | undefined): BeaconType | null {
  if (Object.values(BeaconEnum).includes(name as BeaconEnum)) {
    return data.beacons[name as BeaconEnum];
  } else return null;
}

export function getResource(name: string | undefined): ResourceType | null {
  if (Object.values(ResourceEnum).includes(name as ResourceEnum)) {
    return data.resources[name as ResourceEnum];
  } else return null;
}

export function getUnit(name: string) {
  if (Object.values(UnitEnum).includes(name as UnitEnum)) {
    return data.units[name as UnitEnum];
  } else return null;
}

export function getTerrain(name: string | undefined) {
  if (
    [...Object.values(WallsEnum), ...Object.values(FloorEnum)].includes(
      name as TerrainEnum
    )
  ) {
    return data.terrain[name as TerrainEnum];
  } else return null;
}

export function getRecipe(key: string, buildingName: string | undefined) {
  if (data.recipes[key]?.[buildingName as BuildingEnum])
    return data.recipes[key][buildingName as BuildingEnum];
  else return null;
}

export function getBuildingNameByGameObject(
  name: string,
  settings: SettingsType
) {
  let buildingName;
  if (Object.values(ResourceEnum).includes(name as ResourceEnum)) {
    const resourceName = name as ResourceEnum;
    buildingName =
      settings.gameSettings[settings.gameMode].resources[resourceName];
    if (!buildingName) {
      buildingName = data.resources[resourceName].producedBy[0];
    }
  } else if (Object.values(UnitEnum).includes(name as UnitEnum)) {
    const unitName = name as UnitEnum;
    buildingName = data.units[unitName].producedBy[0];
  }
  const building = getBuilding(buildingName);
  if (
    !building?.inGameModes.includes(settings.gameMode) &&
    settings.gameMode !== GameModeEnum.Any
  )
    return undefined;
  return buildingName;
}

export function getBeaconByBuilding(
  buildingName: string,
  settings: SettingsType
) {
  const building = getBuilding(buildingName);
  if (!building) return undefined;

  const beacons: [string, number][] = [];
  Object.values(BeaconEnum).forEach((beaconName) => {
    const beacon = getBeacon(beaconName);
    if (!beacon) return;
    if (
      (building.inGameModes.includes(settings.gameMode) &&
        beacon.inGameModes.includes(settings.gameMode)) ||
      settings.gameMode === GameModeEnum.Any
    ) {
      beacons.push([beaconName, beacon.distributionEffectivity]);
    }
  });

  return Object.fromEntries(beacons);
}

export function getBoostersByBuilding(buildingName: string) {
  const building = getBuilding(buildingName);
  if (
    !building ||
    !Object.values(ExtractorEnum).includes(buildingName as ExtractorEnum)
  )
    return;

  const extractorBuilding = building as ExtractorType;
  if (!extractorBuilding.booster) return;
  if (Object.keys(extractorBuilding.booster).length == 0) return;

  return Object.fromEntries(
    Object.keys(extractorBuilding.booster!).map((key) => [
      key,
      extractorBuilding.booster![key as ResourceEnum],
    ])
  ) as Record<
    ResourceEnum,
    {
      perSec: number;
      speed: number;
    }
  >;
}

export function getAffinitiesByBuilding(buildingName: string) {
  const building = getBuilding(buildingName);
  if (building && "affinities" in building && building.affinities) {
    return building.affinities;
  }
  return;
}

export function getEffectivityOfBeacon(beaconName: string | undefined) {
  const beacon = getBeacon(beaconName);
  if (!beacon) return 0;

  return beacon.distributionEffectivity;
}

export function getTimeToProduce(
  gameObjectName: ResourceEnum | UnitEnum,
  settings: SettingsType
) {
  const gameObject = getGameObject(gameObjectName);
  if (!gameObject) return { timeToProduce: NaN, usedBoost: undefined };

  const buildingName = getBuildingNameByGameObject(gameObjectName, settings);
  if (!buildingName) return { timeToProduce: NaN, usedBoost: undefined };

  const recipe = getRecipe(gameObject.key, buildingName);
  if (!recipe) return { timeToProduce: NaN, usedBoost: undefined };

  let timeToProduce = recipe.timeToProduce;
  if (!timeToProduce) return { timeToProduce: NaN, usedBoost: undefined };

  let efficiency = 0;
  const beaconName =
    settings.gameSettings[settings.gameMode].beacons[gameObjectName];
  if (beaconName) {
    efficiency = getEffectivityOfBeacon(beaconName);
  }

  let affinity = 1;
  const affinityName =
    settings.gameSettings[settings.gameMode].affinities[gameObjectName];
  const affinities = getAffinitiesByBuilding(buildingName);
  if (affinityName && affinities) {
    efficiency +=
      affinities[Object.values(affinityName)[0] as TerrainEnum]?.efficiency ??
      0;
    affinity =
      affinities[Object.values(affinityName)[0] as TerrainEnum]?.affinity ?? 1;
  }

  let speedBoost = 1;
  let usedBoost:
    | undefined
    | {
        name: string;
        perSec: number;
        speed: number;
      } = undefined;
  if (buildingName) {
    const boostName =
      settings.gameSettings[settings.gameMode].boosts[gameObjectName]?.[
        buildingName
      ];
    const boosts = getBoostersByBuilding(buildingName);
    if (boostName && boosts && boosts[boostName as ResourceEnum].speed) {
      speedBoost = boosts[boostName as ResourceEnum].speed;
      usedBoost = { name: boostName, ...boosts[boostName as ResourceEnum] };
    }
  }

  timeToProduce /= 1 + efficiency;
  timeToProduce /= affinity;
  timeToProduce /= speedBoost;

  return { timeToProduce, usedBoost };
}
export function getProductsPerSec(
  gameObjectName: ResourceEnum | UnitEnum,
  settings: SettingsType
) {
  const gameObject = getGameObject(gameObjectName);
  if (!gameObject) {
    console.warn(
      `getProductsPerSec: gameObject not found for ${gameObjectName}`
    );
    return NaN;
  }

  const buildingName = getBuildingNameByGameObject(gameObjectName, settings);
  if (!buildingName) {
    console.warn(
      `getProductsPerSec: buildingName not found for ${gameObjectName}`
    );
    return NaN;
  }

  const recipe = getRecipe(gameObject.key, buildingName);
  if (!recipe) {
    console.warn(
      `getProductsPerSec: recipe not found for ${gameObject.key} in ${buildingName}`
    );
    return NaN;
  }

  const numOfProducts = recipe.results.find(
    (value) => value.name === gameObjectName
  )?.amount;
  if (!numOfProducts) {
    console.warn(
      `getProductsPerSec: numOfProducts not found for ${gameObjectName} in recipe`
    );
    return NaN;
  }

  return (
    numOfProducts *
    (1 / getTimeToProduce(gameObjectName, settings).timeToProduce)
  );
}

export function calculateProductsPerSec(
  target: ResourceEnum | UnitEnum,
  numOfBuilding: number,
  settings: SettingsType
): number {
  return numOfBuilding * getProductsPerSec(target, settings);
}

export function calculateNumOfBuilding(
  target: ResourceEnum | UnitEnum,
  productsPerSec: number,
  settings: SettingsType
): number {
  return productsPerSec / getProductsPerSec(target, settings);
}

export function generateURL(
  target: string,
  f?: number,
  r?: number
) {
  const urlString = `?item=${target}:${f ? `f:${f}` : `r:${r}`}`;
  return urlString;
}

export function readURL() {
  let target: string | undefined;
  let f: number | undefined = undefined;
  let r: number | undefined = undefined;

  const urlParams = new URLSearchParams(window.location.search);
  console.log("search", window.location.search)

  const item = urlParams.get("item");
  if (item) {
    const parts = item.split(":");
    console.log("parts", parts)
    if (parts.length === 3) {
      target = parts[0];
      if (parts[1] == "f") {
        f = Number(parts[2]);
      } else if (parts[1] == "r") {
        r = Number(parts[2]);
      }
    }
  }

  return {
    target: target,
    f: f,
    r: r,
  };
}
