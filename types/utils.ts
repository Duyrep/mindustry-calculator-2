import { BeaconEnum, BeaconType, BuildingEnum, data, ExtractorEnum, ExtractorType, FactoryEnum, FactoryType, GameModeEnum, ResourceEnum, ResourceType, UnitBuildingEnum, UnitBuildingType, UnitEnum } from "./data/vanilla-7.0";
import { GameSettingsType, SettingsType } from "./types";

export function getDefaultSettings(): SettingsType {
  const gameSettings = {} as Record<GameModeEnum, GameSettingsType>;
  Object.values(GameModeEnum).forEach((gameMode) => {
    gameSettings[gameMode] = getDefaultGameSettings(gameMode)
  })

  return {
    theme: "dark",
    lang: "en",
    displayRate: "second",

    gameMode: GameModeEnum.Serpulo,
    gameSettings: gameSettings
  }
}

function getDefaultGameSettings(gameMode: GameModeEnum): GameSettingsType {
  const resources = {} as Partial<Record<ResourceEnum, BuildingEnum>>;

  Object.values(ResourceEnum).forEach((resourceName) => {
    const resource = getResource(resourceName)
    if (resource && resource.inGameModes.includes(gameMode) && resource.producedBy.length > 1) {
      for (const buildingName of resource.producedBy) {
        const building = getBuilding(buildingName);
        if (building && building.inGameModes.includes(gameMode)) {
          resources[resourceName] = buildingName;
          break;
        }
      }
    }
  })

  return {
    resources: resources,
    beacon: null
  }
}

export function getBuilding(name: string): ExtractorType | FactoryType | UnitBuildingType | null {
  if (Object.values(ExtractorEnum).includes(name as ExtractorEnum)) {
    return data.extractors[name as ExtractorEnum];
  } else if (Object.values(FactoryEnum).includes(name as FactoryEnum)) {
    return data.factories[name as FactoryEnum];
  } else if (Object.values(UnitBuildingEnum).includes(name as UnitBuildingEnum)) {
    return data.unitBuildings[name as UnitBuildingEnum];
  } return null;
}

export function getBeacon(name: string): BeaconType | null {
  if (Object.values(BeaconEnum).includes(name as BeaconEnum)) {
    return data.beacons[name as BeaconEnum];
  } else return null;
}

export function getResource(name: string): ResourceType | null {
  if (Object.values(ResourceEnum).includes(name as ResourceEnum)) {
    return data.resources[name as ResourceEnum];
  } else return null;
}

export function getRecipe(key: string) {
  if (data.recipes[key]) return data.recipes[key]
  else return null
}

export function getBuildingNameByResource(resourceName: string, settings: SettingsType) {
  if (!Object.values(ResourceEnum).includes(resourceName as ResourceEnum)) return undefined;

  resourceName = resourceName as ResourceEnum
  let buildingName;
  buildingName = settings.gameSettings[settings.gameMode].resources[resourceName as ResourceEnum];
  if (!buildingName) {
    buildingName = data.resources[resourceName as ResourceEnum].producedBy[0] as BuildingEnum | undefined;
  }

  return buildingName
}

export function getOutputDataByResource(resourceName: string, settings: SettingsType) {
  const resource = getResource(resourceName);
  if (!resource) return undefined;

  const recipe = getRecipe(resource.key);
  if (!recipe) return undefined;

  const buildingName = getBuildingNameByResource(resourceName, settings);
  if (!buildingName) return undefined;

  const buildingData = recipe.buildings[buildingName];
  if (!buildingData) return undefined;

  const outputData = buildingData.output.find(value => value.name == resourceName);
  if (!outputData) return undefined;

  return outputData
}

export function getBeaconByBuilding(buildingName: string, settings: SettingsType) {
  const building = getBuilding(buildingName);
  if (!building) return undefined;

  const beacons: string[] = []
  Object.values(BeaconEnum).forEach((beaconName) => {
    const beacon = getBeacon(beaconName);
    if (!beacon) return
    if (building.inGameModes.includes(settings.gameMode) && beacon.inGameModes.includes(settings.gameMode)) {
      beacons.push(beaconName)
    }
  })

  return beacons
}

export function calculateProductsPerSec(target: ResourceEnum | UnitEnum, numOfBuilding: number, settings: SettingsType): number {
  if (Object.values(ResourceEnum).includes(target as ResourceEnum)) {

    const outputData = getOutputDataByResource(target, settings);
    if (!outputData) return NaN;

    return outputData.perSec * numOfBuilding;
  } else if (Object.values(UnitEnum).includes(target as UnitEnum)) {
    return NaN
  } else {
    return NaN;
  }
}

export function calculateNumOfBuilding(target: ResourceEnum | UnitEnum, productsPerSec: number, settings: SettingsType): number {
  if (Object.values(ResourceEnum).includes(target as ResourceEnum)) {

    const outputData = getOutputDataByResource(target, settings);
    if (!outputData) return NaN;

    return productsPerSec / outputData.perSec;
  } else if (Object.values(UnitEnum).includes(target as UnitEnum)) {
    return NaN
  } else {
    return NaN;
  }
}

export function isBuildingType(input: string) {
  return (
    Object.values(FactoryEnum).includes(input as FactoryEnum) ||
    Object.values(ExtractorEnum).includes(input as ExtractorEnum) ||
    Object.values(UnitBuildingEnum).includes(input as UnitBuildingEnum)
  );
}