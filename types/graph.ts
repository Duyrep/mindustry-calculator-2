import { Selection, BaseType, select } from "d3";
import { graphviz, GraphvizOptions } from "d3-graphviz";
import { VisualizeRequirementsResult } from "./calculations/visualize";
import { getBuilding, getItem, getTimeUnitInSeconds } from "./utils";
import { enableSVGEvents } from "./events";
import { SettingsType } from "./types";

function convertPolygonToRect(points: string) {
  const coordinates = points
    .trim()
    .split(" ")
    .map((point) => {
      const [x, y] = point.split(",").map(Number);
      return { x, y };
    });

  const xMin = Math.min(...coordinates.map((coord) => coord.x));
  const yMin = Math.min(...coordinates.map((coord) => coord.y));
  const xMax = Math.max(...coordinates.map((coord) => coord.x));
  const yMax = Math.max(...coordinates.map((coord) => coord.y));

  const width = xMax - xMin;
  const height = yMax - yMin;

  return { x: xMin, y: yMin, width, height };
}

export function render(
  graphDirection: "LR" | "TB",
  settings: SettingsType,
  result: VisualizeRequirementsResult
) {
  const option: GraphvizOptions = {
    useWorker: false,
    zoom: false,
    // zoomScaleExtent: [0.8, 2],
    engine: "dot",
  };
  const div = select("#graph-container");
  div.selectAll("div").remove();
  div.append("div").attr("id", "graph");
  const dot = [
    "digraph G {",
    `rankdir=${graphDirection};`,
    "ranksep=1;",
    `node [shape=rect label=""];`,
    `"Output" [label="Output"];`,
  ];

  let surplusExist = false;
  Object.keys(result).forEach((nodeName, index) => {
    dot.push(
      `"${nodeName}" [label="${" ".repeat(8)}:${" ".repeat(10)}x${+(
        result[nodeName].numOfBuilding / getTimeUnitInSeconds(settings)
      ).toFixed(1)}" tooltip="${result[nodeName].productName} ${index} ${
        result[nodeName].imageRow ?? 0
      } ${result[nodeName].imageCol ?? 0}"];`
    );
    Object.entries(result[nodeName].to).forEach(
      ([, { name, productName, productPerSec }]) => {
        dot.push(
          `"${nodeName}" -> "${
            name.split(" ")[0] == "Surplus" ? "Surplus" : name
          }" [label="${" ".repeat(5)}x${+productPerSec.toFixed(3)}/${
            settings.displayRate[0]
          }${" ".repeat(5)}" tooltip="${productName} ${index} ${Object.keys(
            result
          ).indexOf(name.split(" ").join(" "))}"];`
        );
        if (name.split(" ")[0] == "Surplus") surplusExist = true;
      }
    );
  });
  if (surplusExist) dot.push(`"Surplus" [label="Surplus"];`);

  dot.push("}");
  graphviz(select("#graph").node(), option).renderDot(dot.join(""), () => {
    if (!document.querySelector("#graph")?.querySelector("svg")) return;
    const svg = select("#graph").select("svg");
    const polygon = svg.select("polygon");
    const rect = convertPolygonToRect(polygon.attr("points"));

    let svgX = 0,
      svgY = 0,
      svgWidth = 0,
      svgHeight = 0;
    if (+rect.width > rect.height) {
      svgWidth = rect.width;
      svgHeight = svgWidth / (16 / 9);
      if (svgHeight < rect.height) {
        svgHeight = rect.height;
        svgWidth = svgHeight * (16 / 9);
      }
    } else {
      svgHeight = rect.height;
      svgWidth = svgHeight * (16 / 9);
      if (svgWidth < rect.width) {
        svgWidth = rect.width;
        svgHeight = svgWidth / (16 / 9);
      }
    }

    const bbox = (polygon.node() as SVGPolygonElement).getBBox();
    svgX = -svgWidth / 2 + bbox.width / 2;
    svgY = -svgHeight / 2 + bbox.height / 2;

    svg.select("polygon").attr("fill", "transparent");
    svg.selectAll("text").attr("fill", "currentColor");
    svg
      .attr(
        "style",
        "border: 1px hsl(var(--border)) solid; border-radius: calc(var(--radius) - 2px);"
      )
      .attr("viewBox", `${svgX} ${svgY} ${svgWidth} ${svgHeight}`)
      .attr("width", null)
      .attr("height", null);

    renderNodes(svg);
    renderEdges(svg);
    enableSVGEvents(svg, bbox.width / 2, bbox.height / 2);
  });
}

function renderNodes(
  svg: Selection<BaseType, unknown, HTMLElement, SVGSVGElement>
) {
  svg.selectAll(".node").each(function () {
    const polygon = select(this).select("polygon");
    const title = select(this).select("title");
    const a = select(this).select("a");
    const rectPoints = convertPolygonToRect(polygon.attr("points"));
    const [buildingName, gameObjectName] = title.text().split(" ");

    const rect = select((polygon.node() as HTMLElement).parentElement)
      .append("rect")
      .attr("id", title.text())
      .attr("x", rectPoints.x)
      .attr("y", rectPoints.y)
      .attr("width", rectPoints.width)
      .attr("height", rectPoints.height)
      .attr("fill", "transparent")
      .attr("stroke", "currentColor")
      .attr("rx", "2");

    if (a.empty()) return;
    const nodeNumber = a.attr("title").split(" ")[1];
    const imageRow = (parseInt(a.attr("title").split(" ")[2]) ?? 0) * 32;
    const imageCol = (parseInt(a.attr("title").split(" ")[3]) ?? 0) * 32;

    const building = getBuilding(buildingName);
    let BuildingX = 0,
      BuildingY = 0;
    if (building) {
      BuildingX = building.imageCol * 32;
      BuildingY = building.imageRow * 32;
    }

    a.append("svg")
      .attr("viewBox", `${BuildingX} ${BuildingY} 32 32`)
      .attr("width", "32")
      .attr("height", "32")
      .attr("x", rectPoints.x + 40)
      .attr("y", rectPoints.y + 2)
      .append("image")
      .attr("href", "/spritesheet.png")
      .attr("width", 32 * 15)
      .attr("height", 32 * 15)
      .lower();

    const gameObject = getItem(gameObjectName);
    let gameObjectImageRow = 0;
    let gameObjectImageCol = 0;
    if (gameObject) {
      gameObjectImageRow = gameObject.imageRow * 32;
      gameObjectImageCol = gameObject.imageCol * 32;
    }

    a.append("svg")
      .attr(
        "viewBox",
        `${imageCol == 0 ? gameObjectImageCol : imageCol} ${
          imageRow == 0 ? gameObjectImageRow : imageRow
        } 32 32`
      )
      .attr("width", "32")
      .attr("height", "32")
      .attr("x", rectPoints.x + 2)
      .attr("y", rectPoints.y + 2)
      .append("image")
      .attr("href", "/spritesheet.png")
      .attr("width", 32 * 15)
      .attr("height", 32 * 15);

    rect.raise();
    polygon.remove();

    const edges: Selection<BaseType, unknown, null, undefined>[] = [];
    svg.selectAll(".edge").each(function () {
      const a = select(this).select("g").select("a");
      if (a.empty()) return;
      if (!a.attr("title").split(" ").includes(nodeNumber)) return;
      edges.push(select(this));

      rect.on("mouseover", () => {
        rect.attr("stroke", "var(--color-primary)");
        edges.forEach((edge) => {
          edge.select("path").attr("stroke", "var(--color-primary)");
          edge.select("polygon").attr("stroke", "var(--color-primary)");
          edge.select("rect").attr("fill", "var(--color-primary)");
        });
      });

      rect.on("mouseout", () => {
        rect.attr("stroke", "currentColor");
        edges.forEach((edge) => {
          edge.select("path").attr("stroke", "currentColor");
          edge.select("polygon").attr("stroke", "currentColor");
          edge.select("rect").attr("fill", "transparent");
        });
      });
    });
  });
}

function renderEdges(
  svg: Selection<BaseType, unknown, HTMLElement, SVGSVGElement>
) {
  svg.selectAll(".edge").each(function () {
    const edge = select(this);

    edge.select("polygon").attr("stroke", "currentColor").attr("fill", "none");

    edge.select("path").attr("stroke", "currentColor");

    const a = edge.select("g").select("a");
    const text = edge.select("text");
    if (text.empty() || a.empty()) return;
    const textFontSize = Number(text.attr("font-size")) * 2;
    const textBBox = (text.node() as SVGGraphicsElement).getBBox();
    const title = edge.select("g").select("a").attr("title");

    const material = getItem(title.split(" ")[0]);
    let x = 0,
      y = 0;
    if (material) {
      x = material.imageCol * 32;
      y = material.imageRow * 32;
    }

    edge
      .append("svg")
      .attr("viewBox", `${x} ${y} 31 31`)
      .attr("width", "31")
      .attr("height", "31")
      .attr("x", +text.attr("x") - textBBox.width / 2 - textFontSize + 10)
      .attr("y", +text.attr("y") - textFontSize / 2 - 5)
      .append("image")
      .attr("href", "/spritesheet.png")
      .attr("width", 32 * 15 - 1)
      .attr("height", 32 * 15 - 1);

    edge
      .append("rect")
      .attr("x", +text.attr("x") - textBBox.width / 2 - textFontSize + 7)
      .attr("y", +text.attr("y") - textFontSize + 8)
      .attr("width", textBBox.width + 8)
      .attr("height", 32)
      .attr("fill", "transparent")
      .attr("rx", "2")
      .lower();

    // rect1.on("mouseover", () => {
    //   rect2.attr("fill", "hsl(var(--brand))")
    //   path.attr("stroke", "hsl(var(--brand))")
    //   polygon.attr("stroke", "hsl(var(--brand))")
    // })

    // rect1.on("mouseout", () => {
    //   if (hightLight) return
    //   rect2.attr("fill", "transparent")
    //   path.attr("stroke", "currentColor")
    //   polygon.attr("stroke", "currentColor")
    // })
  });
}
