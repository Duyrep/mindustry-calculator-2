import { GameModeEnum } from "./data/vanilla-v8";

export type SettingsType = {
  theme: "dark" | "light";
  lang: string;
  displayRate: string;
  graphDirection: "LR" | "TB";

  gameMode: GameModeEnum;
  gameSettings: Record<GameModeEnum, GameSettingsType>;
};

export type GameSettingsType = {
  items: Record<string, string>;
  beacons: Partial<Record<string, string>>;
  boosts: Partial<Record<string, Record<string, string>>>;
  affinities: Partial<Record<string, Record<string, string>>>;
};
