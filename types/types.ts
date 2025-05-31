import {
  BeaconEnum,
  BuildingEnum,
  ExtractorEnum,
  FloorsEnum,
  GameModeEnum,
  ResourceEnum,
} from "./data/vanilla-7.0";

export type SettingsType = {
  theme: "dark" | "light";
  lang: string;
  displayRate: string;
  graphDirection: 0 | 1;

  gameMode: GameModeEnum;
  gameSettings: Record<GameModeEnum, GameSettingsType>;
};

export type GameSettingsType = {
  resources: Partial<Record<ResourceEnum, BuildingEnum>>;
  beacons: Partial<Record<ResourceEnum, BeaconEnum>>;
  boosts: Partial<
    Record<ResourceEnum | string, Record<ExtractorEnum | string, ResourceEnum | string>>
  >;
  affinities: Partial<
    Record<ResourceEnum | string, Record<BuildingEnum | string, FloorsEnum | string>>
  >;
};
