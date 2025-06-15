import { SettingsType } from "../types";
import { calculateNumOfBuilding, getItem, getRecipe } from "../utils";

export type VisualizeRequirementsResult = Record<
  string,
  {
    imageRow: number;
    imageCol: number;
    productName: string;
    buildingName: string;
    numOfBuilding: number;
    to: Record<
      string,
      {
        name: string;
        productName: string;
        productPerSec: number;
      }
    >;
  }
>;

export function calculateVisualizeRequirements(
  target: string,
  productsPerSec: number,
  settings: SettingsType,
  result: VisualizeRequirementsResult = {},
  to: string = "Output"
) {
  const item = getItem(target);
  if (!item) return result;

  const buildingName = settings.gameSettings[settings.gameMode].items[target];
  if (!buildingName) return result;

  const recipe = getRecipe(item.name)[buildingName];
  if (!recipe) return result;

  const { usedBoost, numOfBuilding } = calculateNumOfBuilding(
    target,
    productsPerSec,
    settings
  );

  const nodeName =
    buildingName + (recipe.output.length > 1 ? "" : " " + target);
  if (result[nodeName]) {
    result[nodeName].numOfBuilding += numOfBuilding;
    if (result[nodeName].to[to + " " + target]) {
      result[nodeName].to[to + " " + target].productPerSec += productsPerSec;
    } else {
      result[nodeName].to[to + " " + target] = {
        name: to,
        productName: target,
        productPerSec: productsPerSec,
      };
    }
  } else {
    result[nodeName] = {
      imageRow: recipe.imageRow ?? 0,
      imageCol: recipe.imageCol ?? 0,
      productName: target,
      buildingName: buildingName,
      numOfBuilding: numOfBuilding,
      to: {
        [to + " " + target]: {
          name: to,
          productName: target,
          productPerSec: productsPerSec,
        },
      },
    };
  }

  if (recipe.input) {
    recipe.input.forEach(({ name, perSec }) => {
      calculateVisualizeRequirements(
        name,
        numOfBuilding * perSec,
        settings,
        result,
        nodeName
      );
    });
  }

  if (recipe.output.length > 1) {
    recipe.output.forEach(({ name, perSec }) => {
      if (name !== target) {
        if (result[nodeName].to["Surplus " + name]) {
          result[nodeName].to["Surplus " + name].productPerSec +=
            numOfBuilding * perSec;
        } else {
          result[nodeName].to["Surplus " + name] = {
            name: "Surplus",
            productName: name,
            productPerSec: numOfBuilding * perSec,
          };
        }
      }
    });
  }

  if (usedBoost) {
    calculateVisualizeRequirements(
      usedBoost.name,
      usedBoost.perSec * numOfBuilding,
      settings,
      result,
      nodeName
    );
  }

  return result;
}
