import Factory from "@/app/page";
import Visualize from "@/app/visualize/page";
import { useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function FactoryVisualize() {
  const panel = useRef<HTMLDivElement>(null);
  const visualize = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (panel.current && visualize.current) {
        if (window.scrollY > panel.current.getBoundingClientRect().y + 45 && visualize.current.getBoundingClientRect().height + 62 < window.innerHeight) {
          visualize.current.style.position = "absolute";
          visualize.current.style.top = window.scrollY - 93 + "px";
        } else {
          visualize.current.style.position = "";
          visualize.current.style.top = "";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={panel}>
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel minSize={10} defaultSize={30}>
          <Factory />
        </Panel>
        <PanelResizeHandle className="flex items-center px-1">
          <div className="border-2 rounded-md h-10"></div>
        </PanelResizeHandle>
        <Panel minSize={25}>
          <div className="w-full relative">
            <div ref={visualize} className="w-full">
              <Visualize />
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
