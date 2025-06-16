import {
  BeaconEnum,
  BuildingEnum,
  data,
  FloorEnum,
  GameModeEnum,
  ItemEnum,
  recipes,
} from "./data/vanilla-v8";
import { GameSettingsType, SettingsType } from "./types";

export function getProductsPerSec(name: string, settings: SettingsType) {
  const item = getItem(name);
  if (!item) return { perSec: NaN, usedBoost: undefined };

  const recipe = getRecipe(item.name);
  if (!recipe) return { perSec: NaN, usedBoost: undefined };

  const buildingName = settings.gameSettings[settings.gameMode].items[name];
  const building = getBuilding(buildingName);
  if (!building) return { perSec: NaN, usedBoost: undefined };

  let perSec = recipe[buildingName]?.output.find(
    (value) => value.name === name
  )?.perSec;
  if (!perSec) return { perSec: NaN, usedBoost: undefined };

  const beacon = getBeacon(
    settings.gameSettings[settings.gameMode].beacons[name as ItemEnum] ?? ""
  );
  if (beacon) {
    perSec += perSec * beacon.speedIncrease;
  }

  const booster = getBoostersByBuilding(buildingName);
  const boostName =
    settings.gameSettings[settings.gameMode].boosts[name]?.[buildingName];
  let usedBoost;
  if (booster && boostName) {
    perSec *= booster[boostName as ItemEnum]?.speedBoost ?? 1;
    usedBoost = {
      name: boostName,
      perSec: booster[boostName as ItemEnum]?.perSec ?? NaN,
    };
  }

  const affinities = getAffinitiesByBuilding(buildingName);
  const affinityName =
    settings.gameSettings[settings.gameMode].affinities[name]?.[buildingName];
  if (affinities && affinityName) {
    const affinity = affinities[affinityName as FloorEnum]?.affinity;
    const efficiency = affinities[affinityName as FloorEnum]?.efficiency;
    if (affinity) {
      perSec += perSec * affinity;
    }
    if (efficiency) {
      perSec += perSec * efficiency;
    }
  }

  return { perSec, usedBoost };
}

export function calculateProductsPerSec(
  target: string,
  numOfBuilding: number,
  settings: SettingsType
) {
  return getProductsPerSec(target, settings).perSec * numOfBuilding;
}

export function calculateNumOfBuilding(
  target: string,
  productsPerSec: number,
  settings: SettingsType
) {
  const { perSec, usedBoost } = getProductsPerSec(target, settings);
  return { numOfBuilding: productsPerSec / perSec, usedBoost };
}

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

export function getDefaultGameSettings(
  gameMode: GameModeEnum
): GameSettingsType {
  const itemSettings = {} as Record<string, string>;
  Object.values(ItemEnum).forEach((itemName) => {
    const item = getItem(itemName);
    if (
      item &&
      (item.inGameModes.includes(gameMode) || gameMode === GameModeEnum.Any)
    ) {
      const buildingName = item.producedBy[0];
      const building = getBuilding(buildingName);

      if (!building) return;
      if (
        !building.inGameModes.includes(gameMode) &&
        gameMode !== GameModeEnum.Any
      )
        return;

      itemSettings[itemName] = buildingName.length === 0 ? "" : buildingName;
    }
  });

  return {
    items: itemSettings,
    beacons: Object.fromEntries(
      Object.keys(ItemEnum)
        .map((key) => {
          const item = getItem(key);
          if (!item) return [];
          if (!item.inGameModes.includes(gameMode)) return [];
          return [key, null];
        })
        .filter((value) => value.length != 0)
    ),
    boosts: {},
    affinities: (() => {
      const affinities: Record<string, Record<string, string>> = {};
      Object.values(ItemEnum).forEach((itemName) => {
        const item = getItem(itemName);
        if (!item) return;
        item.producedBy.forEach((buildingName) => {
          const building = getBuilding(buildingName);
          if (!building) return;
          if (!building.affinities) return;
          const affinity = Object.keys(building.affinities)[0];
          if (!affinity) return;
          if (!building.inGameModes.includes(gameMode)) return;
          if (!affinities[itemName]) affinities[itemName] = {};
          affinities[itemName][buildingName] = affinity;
        });
      });
      return affinities;
    })(),
  };
}

export function getTimeUnitInSeconds(settings: SettingsType) {
  return settings.displayRate == "minute"
    ? 60
    : settings.displayRate == "hour"
    ? 3600
    : 1;
}

export function getItem(name: string) {
  if (!Object.values(ItemEnum).includes(name as ItemEnum)) return;
  return data.items[name as ItemEnum];
}

export function getBuilding(name: string) {
  if (!Object.values(BuildingEnum).includes(name as BuildingEnum)) return;
  return data.buildings[name as BuildingEnum];
}

export function getRecipe(name: string) {
  return recipes?.[name];
}

export function getBeacon(name: string) {
  return data.beacons[name as BeaconEnum];
}

export function getBoostersByBuilding(name: string) {
  const building = getBuilding(name);
  return building?.booster;
}

export function getAffinitiesByBuilding(name: string) {
  const building = getBuilding(name);
  return building?.affinities;
}

export function getTerrain(name: string) {
  return data.floors[name as FloorEnum];
}
