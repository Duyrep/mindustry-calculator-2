"use client";

import InputTarget from "@/components/InputTarget";
import { SettingsContext } from "@/context/SettingsContext";
import { useContext } from "react";

export default function Visualize() {
  const [settings, setSettings] = useContext(SettingsContext).settingsState;

  return (
    <>
      <InputTarget />

      <div className="bg-surface-a10 rounded-md p-2 flex flex-wrap gap-2 items-center">
        <span>Graph direction:</span>
        <div className="flex flex-wrap gap-2">
          <div
            className={`cursor-pointer select-none rounded-md p-1 transition-colors ${
              settings.graphDirection == 0 ? "bg-primary" : "bg-surface-a20"
            }`}
            onClick={() =>
              setSettings((prev) => prev.graphDirection == 0 ? prev : ({ ...prev, graphDirection: 0 }))
            }
          >
            Top to bottom
          </div>
          <div
            className={`cursor-pointer select-none rounded-md p-1 transition-colors ${
              settings.graphDirection == 1 ? "bg-primary" : "bg-surface-a20"
            }`}
            onClick={() =>
              setSettings((prev) => prev.graphDirection == 1 ? prev : ({ ...prev, graphDirection: 1 }))
            }
          >
            Left to right
          </div>
        </div>
      </div>
    </>
  );
}
