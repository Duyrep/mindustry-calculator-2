"use client";

import { SettingsContext } from "@/context/SettingsContext";
import { TargetContext } from "@/context/TargetContext";
import { calculateVisualizeRequirements } from "@/types/calculations/visualize";
import { render } from "@/types/graph";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Visualize() {
  const { t } = useTranslation();
  const router = useRouter();
  const target = useContext(TargetContext).target;
  const productsPerSec = useContext(TargetContext).productsPerSec;
  const [settings, setSettings] = useContext(SettingsContext).settingsState;

  useEffect(() => {
    const result = calculateVisualizeRequirements(
      target,
      productsPerSec,
      settings
    );
    console.log(result)
    render(settings.graphDirection, settings, result);
  }, [target, settings, productsPerSec]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        router.push("/");
      }
    };
    handleResize()

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="bg-surface-a10 rounded-md p-2 flex flex-wrap gap-2 items-center">
          <span>{t("Graph direction")}:</span>
          <div className="flex flex-wrap gap-2">
            <div
              className={`cursor-pointer select-none rounded-md p-1 transition-colors ${
                settings.graphDirection == "TB"
                  ? "bg-primary"
                  : "bg-surface-a20"
              }`}
              onClick={() =>
                setSettings((prev) =>
                  prev.graphDirection == "TB"
                    ? prev
                    : { ...prev, graphDirection: "TB" }
                )
              }
            >
              {t("Top to bottom")}
            </div>
            <div
              className={`cursor-pointer select-none rounded-md p-1 transition-colors ${
                settings.graphDirection == "LR"
                  ? "bg-primary"
                  : "bg-surface-a20"
              }`}
              onClick={() =>
                setSettings((prev) =>
                  prev.graphDirection == "LR"
                    ? prev
                    : { ...prev, graphDirection: "LR" }
                )
              }
            >
              {t("Left to right")}
            </div>
          </div>
        </div>
        <div>
          <div
            id="graph-container"
            className="border border-surface-a20 rounded-md select-none"
          >
            <div id="graph"></div>
          </div>
        </div>
      </div>
    </>
  );
}
