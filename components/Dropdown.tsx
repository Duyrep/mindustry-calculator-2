import { ResourceEnum, ResourceGroupEnum } from "@/types/data/vanilla-7.0";
import { useContext, useEffect, useRef, useState } from "react";
import CustomImage from "./CustomImage";
import { getResource } from "@/types/utils";
import { rippleEffect } from "./RippleEffect";
import { SettingsContext } from "@/context/SettingsContext";
import { TargetContext } from "@/context/TargetContext";

export default function Dropdown() {
  const settings = useContext(SettingsContext).settingsState[0];
  const target = useContext(TargetContext).target;
  const setTarget = useContext(TargetContext).setTarget;
  const [show, setShow] = useState(false);
  const cursorIndicatorResourceBackground = useRef<HTMLDivElement | null>(null);
  const menuWrapper = useRef<HTMLDivElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const resourceRefs = useRef<Record<ResourceEnum, HTMLDivElement | null>>(
    {} as unknown as Record<ResourceEnum, HTMLDivElement>
  );
  const menuScroll = useRef<HTMLDivElement | null>(null);

  const getTargetName = () => {
    const resource = getResource(target);
    if (
      resource &&
      resource.localizedName &&
      resource.localizedName[settings.lang]
    )
      return resource.localizedName[settings.lang];
    else return target;
  };

  useEffect(() => {
    const updateMenuWrapperStyle = () => {
      if (menuWrapper.current && container.current) {
        if (show) {
          if (window.scrollY <= 48) {
            menuWrapper.current.style.top = `${
              container.current.getBoundingClientRect().y +
              container.current.getBoundingClientRect().height
            }px`;
            menuWrapper.current.style.height =
              "calc(100% - var(--nav-height) - .25rem)";
          } else {
            menuWrapper.current.style.top = "";
            menuWrapper.current.style.height =
              "calc(100% - var(--nav-height) / 2 - .25rem)";
          }
        } else {
          menuWrapper.current.style.height = "0";
        }
      }
    };

    const handler = () => {
      updateMenuWrapperStyle();
    };
    handler();

    if (menuWrapper.current) {
      if (show) menuWrapper.current.style.transition = "height 0.4s linear";
      else menuWrapper.current.style.transition = "height 0.2s linear";
    }

    window.addEventListener("scroll", handler);

    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuWrapper.current &&
        !menuWrapper.current.contains(event.target as HTMLElement) &&
        container.current &&
        !container.current.contains(event.target as HTMLElement)
      ) {
        setShow(false);
      }
    };

    const handleScroll = () => {
      const windowWidth = window.innerWidth;
      const menuCurrent = menu.current;
      const menuScrollCurrent = menuScroll.current;
      if (menuCurrent && menuScrollCurrent) {
        const menuWidth = menuCurrent.getBoundingClientRect().width;
        if (menuWidth > windowWidth) {
          menuScrollCurrent.style.width = windowWidth + "px";
        } else {
          menuScrollCurrent.style.width = "";
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div ref={container} className="relative select-none z-10">
      <div
        className="flex gap-2 cursor-pointer text-center items-center h-full px-4 overflow-hidden relative"
        onClick={(event) => {
          setShow((prev) => !prev);
          rippleEffect(event);
        }}
      >
        <CustomImage name={target} />
        {getTargetName()}
      </div>
      <div
        ref={menuWrapper}
        className={`fixed flex flex-col h-0 bg-surface-a10 rounded-md left-1 overflow-hidden max-h-fit `}
      >
        <div ref={menuScroll} className="overflow-auto p-2">
          <div
            ref={menu}
            className="relative w-max h-max flex flex-col border-surface-a30"
          >
            <div
              ref={cursorIndicatorResourceBackground}
              className="fixed z-10 w-0 h-10 rounded-md bg-surface-a20 transition-all"
            ></div>
            {Object.values(ResourceGroupEnum).map((group) => (
              <div key={group}>
                <b>{group}</b>
                <hr />
                <div className="grid grid-cols-4 z-10 gap-2 w-max">
                  {Object.values(ResourceEnum).map((resourceName) => {
                    const resource = getResource(resourceName);
                    if (!resource) return;
                    if (resource.group != group) return;
                    // if (!resource.inGameModes.includes(settings.gameMode)) return

                    return (
                      <div
                        key={resourceName}
                        ref={(el) => {
                          resourceRefs.current[resourceName] = el;
                        }}
                        className={`cursor-pointer z-10 p-1 rounded-md transition-colors w-max h-max ${
                          target == resourceName && "bg-primary"
                        }`}
                        onClick={() => {
                          setTarget(resourceName);
                          setShow(false);
                        }}
                        onMouseEnter={(event) => {
                          const target = event.currentTarget as HTMLElement;
                          const current =
                            cursorIndicatorResourceBackground.current;
                          if (current && menu.current) {
                            const rect = target.getBoundingClientRect();
                            current.style.opacity = "1";
                            current.style.top = rect.y + "px";
                            current.style.left = rect.x + "px";
                            current.style.width = `${rect.width}px`;
                          }
                        }}
                        onMouseLeave={() => {
                          const current =
                            cursorIndicatorResourceBackground.current;
                          if (current) current.style.opacity = "0";
                        }}
                        onMouseUp={() => {
                          const current =
                            cursorIndicatorResourceBackground.current;
                          if (current) current.style.opacity = "0";
                        }}
                      >
                        <div className="z-50">
                          <CustomImage name={resourceName} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
