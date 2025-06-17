"use client";

import { SettingsContext } from "@/context/SettingsContext";
import { TargetContext } from "@/context/TargetContext";
import { calculateVisualizeRequirements } from "@/types/calculations/visualize";
import {
  BaseEdge,
  Controls,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  EdgeTypes,
  getBezierPath,
  Handle,
  Node,
  NodeProps,
  NodeTypes,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { useContext, useEffect, useState } from "react";
import InputTarget from "@/components/InputTarget";
import Factory from "../page";
import Visualize from "../visualize/page";
import CustomImage from "@/components/CustomImage";
import { getBuilding, getItem } from "@/types/utils";
import { GameModeEnum } from "@/types/data/vanilla-v8";

export default function Test() {
  const target = useContext(TargetContext).target;
  const productsPerSec = useContext(TargetContext).productsPerSec;
  const settings = useContext(SettingsContext).settingsState[0];
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const nodeTypes: NodeTypes = {
    custom: CustomNode,
  };
  const edgeTypes: EdgeTypes = {
    custom: CustomEdge,
  };

  useEffect(() => {
    const result = calculateVisualizeRequirements(
      target,
      productsPerSec,
      settings
    );

    const g = new dagre.graphlib.Graph();
    const initialEdges: {
      sourceId: string;
      targetId: string;
      value?: string | dagre.Label | undefined;
      name?: string;
    }[] = [];

    g.setGraph({
      nodesep: 70,
      ranksep: 70,
    });
    g.setDefaultEdgeLabel(function () {
      return {};
    });
    g.setNode("Output", { label: "Output", width: 100, height: 60 });

    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) ctx.font = "16px Arial";
    Object.keys(result).forEach((nodeName) => {
      const width = ctx ? ctx.measureText(`x${result[nodeName].numOfBuilding}`).width : 0;
      g.setNode(nodeName, {
        label: `${result[nodeName].buildingName} ${result[nodeName].productName} x${result[nodeName].numOfBuilding}`,
        width: width * 5/4,
        height: 60,
        buildingName: result[nodeName].buildingName,
        productName: result[nodeName].productName,
        numOfBuilding: result[nodeName].numOfBuilding,
      });
      Object.entries(result[nodeName].to).forEach(
        ([, { name, productName, productPerSec }]) => {
          initialEdges.push({
            sourceId: nodeName,
            targetId: name,
            value: {
              productName: productName,
              productsPerSec: productPerSec,
            },
          });
          g.setEdge(nodeName, name);
        }
      );
    });

    dagre.layout(g);

    const nodes: Node[] = g.nodes().map((nodeId) => {
      const node = g.node(nodeId);
      console.log("Node", node);
      return {
        id: nodeId,
        type: "custom",
        data: node,
        position: { x: node.x, y: node.y },
      };
    });
    const edges: Edge[] = initialEdges.map(({ sourceId, targetId, value }) => {
      return {
        id: `e${sourceId}-${targetId}`,
        type: "custom",
        data: (value ?? { "": "" }) as Record<string, unknown>,
        source: sourceId,
        target: targetId,
        animated: true,
      };
    });

    setNodes(nodes);
    setEdges(edges);
    fitView();
  }, [target, settings, productsPerSec]);

  return (
    <>
      <InputTarget />
      <div className="border border-surface-a30 rounded-md w-full h-[calc(100vw/(16/9))]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Controls className="bg-surface-a20 rounded-md" />
        </ReactFlow>
      </div>
      <Visualize />
      <Factory />
    </>
  );
}

function CustomNode(props: NodeProps) {
  const data = props.data;

  return (
    <div className="p-1 border border-surface-a50 rounded-md">
      <Handle type={"target"} position={Position.Top} />
      {data.label == "Output" ? (
        <div>Output</div>
      ) : (
        <div className="flex gap-1 items-center">
          <CustomImage name={String(data.productName)} />
          <span>:</span>
          <DropDown
            productName={String(data.productName)}
            buildingName={String(data.buildingName)}
          />
          <span>x{+Number(data.numOfBuilding).toFixed(1)}</span>
        </div>
      )}
      <Handle type={"source"} position={Position.Bottom} />
    </div>
  );
}

function DropDown({
  productName,
  buildingName,
}: {
  productName: string;
  buildingName: string;
}) {
  const [show, setShow] = useState(false);
  const product = getItem(productName);
  const [settings, setSettings] = useContext(SettingsContext).settingsState;

  return (
    <div className="relative">
      {product && product.producedBy.length > 1 ? (
        <>
          <div
            className="border rounded-md border-surface-a20 hover:border-primary duration-100 p-1 cursor-pointer"
            onClick={() => setShow((prev) => !prev)}
          >
            <CustomImage name={buildingName} />
          </div>
          <div
            className={`absolute ${
              !show && "hidden"
            } z-10 flex border border-surface-a30 rounded-md bg-surface-a10 gap-1 p-1`}
            style={{ transform: "translate(-48px, 6px)" }}
          >
            {product.producedBy
              .map((buildingName) => {
                const building = getBuilding(buildingName);
                if (!building) return;
                if (
                  !building.inGameModes.includes(settings.gameMode) &&
                  settings.gameMode !== GameModeEnum.Any
                )
                  return;
                return buildingName;
              })
              .filter((value) => value !== undefined)
              .map((buildingName, idx) => (
                <div
                  key={idx}
                  className="w-max h-max p-1 cursor-pointer"
                  onClick={() => {
                    setShow(false);
                    setSettings((prev) => ({
                      ...prev,
                      gameSettings: {
                        ...prev.gameSettings,
                        [prev.gameMode]: {
                          ...prev.gameSettings[prev.gameMode],
                          items: {
                            ...prev.gameSettings[prev.gameMode].items,
                            [productName]: buildingName,
                          },
                        },
                      },
                    }));
                  }}
                >
                  <CustomImage name={buildingName} size={38} />
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className="p-[5px]">
          <CustomImage name={buildingName} />
        </div>
      )}
    </div>
  );
}

function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const settings = useContext(SettingsContext).settingsState[0];

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="absolute flex gap-1 items-center"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {data && (
            <>
              <CustomImage name={String(data.productName)} />
              <span>
                x {+Number(data.productsPerSec).toFixed(3)}/
                {settings.displayRate[0]}
              </span>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
