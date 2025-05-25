import { BuildingEnum, ResourceEnum, UnitEnum } from "../data/vanilla-7.0";
import { SettingsType } from "../types";
import { calculateNumOfBuilding, getBuildingNameByResource, getRecipe, getResource } from "../utils";

export type FactoryRequirementsResult = {
  result: {
    buildingName: BuildingEnum;
    numOfBuilding: number;
    productName: ResourceEnum | UnitEnum
    numOfProductsPerSec: number;
    energyUsage: number
  }[]
  totalEnergyUsage: number;
}

export function calculateFactoryRequirements(
  target: ResourceEnum | UnitEnum,
  productsPerSec: number,
  settings: SettingsType,
  result: FactoryRequirementsResult = {
    result: [],
    totalEnergyUsage: 0
  }
): FactoryRequirementsResult {
  const resource = getResource(target)
  if (!resource) return result;

  const recipe = getRecipe(resource.key);
  if (!recipe) return result;

  const buildingName = getBuildingNameByResource(target, settings);
  if (!buildingName) return result;

  const buildingData = recipe.buildings[buildingName];
  if (!buildingData) return result;

  const outputData = buildingData.output.find(value => value.name == target);
  if (!outputData) return result;

  const numOfBuilding = calculateNumOfBuilding(target, productsPerSec, settings);

  result.result.push({
    buildingName: buildingName,
    numOfBuilding: numOfBuilding,
    productName: target,
    numOfProductsPerSec: productsPerSec,
    energyUsage: 0
  });

  buildingData.input.forEach(( { name, perSec } ) => calculateFactoryRequirements(name, perSec * numOfBuilding, settings, result));

  return result;
}