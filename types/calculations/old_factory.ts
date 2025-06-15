import { BuildingEnum, ResourceEnum, UnitEnum } from "../data/vanilla-7.0";
import { SettingsType } from "../types";
import {
  calculateNumOfBuilding,
  getBuilding,
  getBuildingNameByGameObject,
  getGameObject,
  getRecipe,
  getTimeToProduce,
} from "../utils";

export type FactoryRequirementsResult = {
  result: Partial<
    Record<
      ResourceEnum | UnitEnum,
      {
        buildingName: BuildingEnum;
        numOfBuilding: number;
        numOfProductsPerSec: number;
        imageRow?: number;
        imageCol?: number;
      }
    >
  >;
  energyUsage: {
    buildings: Partial<Record<BuildingEnum, number>>;
    generated: number;
    used: number;
  };
};

export function calculateFactoryRequirements(
  target: ResourceEnum | UnitEnum,
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
  const gameObject = getGameObject(target);
  if (!gameObject) return result;

  const buildingName = getBuildingNameByGameObject(target, settings);
  if (!buildingName) return result;

  const building = getBuilding(buildingName);
  if (!building) return result;

  const recipe = getRecipe(gameObject.key, buildingName);
  if (!recipe) return result;

  const numOfProduct = recipe.results.find(
    (value) => value.name === target
  )?.amount;
  if (!numOfProduct) return result;

  const { timeToProduce, usedBoost } = getTimeToProduce(target, settings);
  if (!timeToProduce) return result;

  const numOfBuilding = calculateNumOfBuilding(
    target,
    productsPerSec,
    settings
  );

  const energyUsage = building.energyUsage;
  if (energyUsage > 0) {
    result.energyUsage.used += energyUsage * numOfBuilding;
  } else {
    result.energyUsage.used += energyUsage * numOfBuilding;
  }

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
      imageRow: recipe.imageRow,
      imageCol: recipe.imageCol,
    };
  }

  console.log(recipe.ingredients)
  if (recipe.ingredients) {
    Object.values(recipe.ingredients).forEach(({ name, amount }) => {
      calculateFactoryRequirements(
        name,
        numOfBuilding * amount * (1 / timeToProduce),
        settings,
        result
      );
    });
  }

  if (usedBoost) {
    calculateFactoryRequirements(
      usedBoost.name as ResourceEnum,
      usedBoost.perSec * numOfBuilding,
      settings,
      result
    );
  }

  return result;
}
