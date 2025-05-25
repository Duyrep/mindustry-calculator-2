import { BeaconEnum, BuildingEnum, GameModeEnum, ResourceEnum } from "./data/vanilla-7.0";

export type SettingsType = {
  theme: "dark" | "light";
  lang: string;
  displayRate: string;

  gameMode: GameModeEnum;
  gameSettings: Record<GameModeEnum, GameSettingsType>;
}

export type GameSettingsType = {
  resources: Partial<Record<ResourceEnum, BuildingEnum>>;
  beacon: BeaconEnum | null;
}