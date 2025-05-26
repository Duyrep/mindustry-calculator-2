import { SettingsContext } from "@/context/SettingsContext";
import { getBeacon, getBuilding, getResource } from "@/types/utils";
import Image from "next/image";
import { useContext } from "react";

export default function CustomImage({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  const settings = useContext(SettingsContext).settingsState[0];

  let imageRow = 0,
    imageCol = 0,
    title = "oh no";

  const resource = getResource(name);
  if (resource) {
    imageRow = resource.imageRow;
    imageCol = resource.imageCol;
    title = resource.localizedName?.[settings.lang] || name;
  }

  const beacon = getBeacon(name);
  if (beacon) {
    imageRow = beacon.imageRow;
    imageCol = beacon.imageCol;
    title = beacon.localizedName?.[settings.lang] || name;
  }

  const building = getBuilding(name);
  if (building) {
    imageRow = building.imageRow;
    imageCol = building.imageCol;
    title = building.localizedName?.[settings.lang] || name;
  }

  const row = -imageRow * size;
  const col = -imageCol * size;

  return (
    <div className="w-max h-max">
      <Image
        src="/pixel.gif"
        alt={title}
        title={title}
        width={size}
        height={size}
        style={{
          userSelect: "none",
          background: `url('/spritesheet.png') ${col}px ${row}px ${
            size ? `/ ${size * 14}px ${size * 14}px` : ""
          }`,
        }}
        draggable={false}
      />
    </div>
  );
}
