import { ItemEnum } from "../data/vanilla-v8";
import { SettingsType } from "../types";
import {
  calculateNumOfBuilding,
  getBeacon,
  getBuilding,
  getItem,
  getRecipe,
} from "../utils";

export type FactoryRequirementsResult = {
  result: Partial<
    Record<
      string,
      {
        buildingName: string;
        numOfBuilding: number;
        numOfProductsPerSec: number;
      }
    >
  >;
  energyUsage: {
    buildings: Partial<Record<string, number>>;
    generated: number;
    used: number;
  };
};

export function calculateFactoryRequirements(
  target: string,
  productsPerSec: number,
  settings: SettingsType,
  result: FactoryRequirementsResult = {
    result: {},
    energyUsage: {
      buildings: {},
      generated: 0,
      used: 0,
    },
  }
): FactoryRequirementsResult {
  const item = getItem(target);
  if (!item) return result;

  const buildingName = settings.gameSettings[settings.gameMode].items[target];
  const building = getBuilding(buildingName);
  if (!building) return result;

  const { usedBoost, numOfBuilding } = calculateNumOfBuilding(
    target,
    productsPerSec,
    settings
  );

  const beacon = getBeacon(
    settings.gameSettings[settings.gameMode].beacons[target as ItemEnum] ?? ""
  );

  if (result.result[target]) {
    result.result[target].numOfBuilding += numOfBuilding;
    result.result[target].numOfProductsPerSec += productsPerSec;
    const updatedEntry = result.result[target];
    delete result.result[target];
    result.result = {
      ...result.result,
      [target]: updatedEntry,
    };
  } else {
    result.result[target] = {
      buildingName: buildingName,
      numOfBuilding: numOfBuilding,
      numOfProductsPerSec: productsPerSec,
    };
  }

  const recipe = getRecipe(item.name);
  if (!recipe) return result;

  recipe[buildingName]?.input?.forEach(({ name, perSec }) => {
    calculateFactoryRequirements(
      name,
      perSec * numOfBuilding + (beacon ? perSec * beacon.speedIncrease : 0),
      settings,
      result
    );
  });

  if (usedBoost) {
    calculateFactoryRequirements(
      usedBoost.name,
      usedBoost.perSec * numOfBuilding,
      settings,
      result
    );
  }

  return result;
}

// function calculateItem(){

// }

// function calculateLiquid() {

// }

// function calculateCrafter() {

// }

// function calculateExtractor() {

// }
