import { getBeacon, getBuilding, getItem, getTerrain } from "@/types/utils";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function CustomImage({
  name,
  row = 0,
  col = 0,
  size = 32,
}: {
  name: string;
  size?: number;
  row?: number;
  col?: number;
}) {
  const {t} = useTranslation();

  let imageRow = row,
    imageCol = col,
    title = "oh no";

  if (row < 1 && col < 1) {
    const resource = getItem(name);
    if (resource) {
      imageRow = resource.imageRow;
      imageCol = resource.imageCol;
    }

    const building = getBuilding(name);
    if (building) {
      imageRow = building.imageRow;
      imageCol = building.imageCol;
    }

    const beacon = getBeacon(name);
    if (beacon) {
      imageRow = beacon.imageRow;
      imageCol = beacon.imageCol;
    }

    const terrain = getTerrain(name);
    if (terrain) {
      imageRow = terrain.imageRow;
      imageCol = terrain.imageCol;
    }
  }
  title = t(name)

  const bgRow = -imageRow * size;
  const bgCol = -imageCol * size;

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
          background: `url('/spritesheet.png') ${bgCol}px ${bgRow}px ${
            size ? `/ ${size * 15}px ${size * 15}px` : ""
          }`,
        }}
        draggable={false}
      />
    </div>
  );
}
