"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, DarkMode, LightMode } from "./Icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SettingsContext } from "@/context/SettingsContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { rippleEffect } from "./RippleEffect";
import { TargetContext } from "@/context/TargetContext";
import CustomImage from "./CustomImage";
import { ResourceEnum, ResourceGroupEnum } from "@/types/data/vanilla-7.0";
import { getResource } from "@/types/utils";

export default function Header() {
  const pathName = usePathname();
  const target = useContext(TargetContext).target;
  const cursorIndicator = useRef<HTMLDivElement | null>(null);
  const underline = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabContainer = useRef<HTMLDivElement | null>(null);
  const navigation = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const arrowLeft = useRef<HTMLDivElement | null>(null);
  const arrowRight = useRef<HTMLDivElement | null>(null);
  const tabGroup = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useContext(SettingsContext).themeState;
  const [showDropdown, setShowDropdown] = useState(false);

  const Tab = ({
    children,
    name,
    className,
  }: {
    children?: React.ReactNode;
    name: string;
    className?: string;
  }) => (
    <div
      ref={(el) => {
        tabRefs.current[name] = el;
      }}
      onClick={(event) => rippleEffect(event)}
      onMouseEnter={(event) => {
        const target = event.currentTarget as HTMLElement;
        if (cursorIndicator.current && tabContainer.current) {
          const rect = target.getBoundingClientRect();
          const scrollLeft = tabContainer.current.scrollLeft;
          cursorIndicator.current.style.opacity = "1";
          cursorIndicator.current.style.left = rect.x + scrollLeft + "px";
          cursorIndicator.current.style.width = `${rect.width}px`;
        }
      }}
      onMouseLeave={() => {
        if (cursorIndicator.current)
          cursorIndicator.current.style.opacity = "0";
      }}
      onMouseUp={() => {
        if (cursorIndicator.current)
          cursorIndicator.current.style.opacity = "0";
      }}
      className={
        "relative cursor-pointer px-4 p-2 overflow-hidden flex items-center" +
        className
      }
    >
      {children}
    </div>
  );

  const updateNavigationArrow = () => {
    const current = navigation.current;
    if (
      current &&
      arrowLeft.current &&
      arrowRight.current &&
      tabContainer.current &&
      tabGroup.current
    ) {
      if (window.innerWidth < tabGroup.current.getBoundingClientRect().width) {
        arrowRight.current.style.display = "";
        tabContainer.current.classList.add(
          "mask-l-from-80%",
          "mask-l-to-100%",
          "mask-r-from-80%",
          "mask-r-to-100%"
        );
        if (tabContainer.current.scrollLeft == 0) {
          arrowLeft.current.style.display = "none";
          tabContainer.current.classList.remove(
            "mask-l-from-80%",
            "mask-l-to-100%"
          );
        } else {
          arrowLeft.current.style.display = "block";
        }
        if (
          tabContainer.current.scrollLeft ==
          tabContainer.current.scrollWidth - window.innerWidth
        ) {
          arrowRight.current.style.display = "none";
          tabContainer.current.classList.remove(
            "mask-r-from-80%",
            "mask-r-to-100%"
          );
        } else {
          arrowRight.current.style.display = "block";
        }
      } else {
        arrowLeft.current.style.display = "none";
        arrowRight.current.style.display = "none";
        tabContainer.current.classList.remove(
          "mask-l-from-80%",
          "mask-l-to-100%",
          "mask-r-from-80%",
          "mask-r-to-100%"
        );
      }
    }
  };

  useEffect(() => {
    if (!tabRefs.current) return;
    Object.keys(tabRefs.current).forEach((tabName) => {
      if (pathName == tabName) {
        if (
          tabRefs.current[tabName] &&
          underline.current &&
          tabContainer.current
        ) {
          const rect = tabRefs.current[tabName].getBoundingClientRect();
          const scrollLeft = tabContainer.current.scrollLeft;
          underline.current.style.left = rect.x + scrollLeft + "px";
          underline.current.style.width = `${rect.width}px`;
        }
      }
    });
  }, [pathName, target]);

  useEffect(() => {
    updateNavigationArrow();
  }, [target]);

  useEffect(() => {
    const handleScroll = () => {
      if (navigation.current && headerRef.current && navigation) {
        const navigationCurrent = navigation.current;
        const headerCurrent = headerRef.current;
        const navigationHeight =
          navigation.current.getBoundingClientRect().height;

        if (window.scrollY >= navigationHeight) {
          navigationCurrent.style.position = "fixed";
          navigationCurrent.style.top = "0";
          navigationCurrent.style.left = "0";
          headerCurrent.style.marginBottom = navigationHeight + "px";
        } else {
          navigationCurrent.style.position = "";
          navigationCurrent.style.top = "";
          navigationCurrent.style.right = "";
          headerCurrent.style.marginBottom = "";
        }
      }
    };

    updateNavigationArrow();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateNavigationArrow);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateNavigationArrow);
    };
  }, []);

  return (
    <div className="h-max flex flex-col">
      <header
        ref={headerRef}
        className="flex items-center justify-between px-4 py-2 bg-primary dark:bg-surface-a10"
      >
        <Link
          href={"/"}
          className="h-full flex gap-4 items-center outline-none"
        >
          <div className="flex gap-1">
            <div className="w-max flex items-center">
              <div className="flex w-6 h-6">
                <Image
                  src={"/favicon.ico"}
                  width={28}
                  height={28}
                  alt="icon"
                  draggable="false"
                />
              </div>
            </div>
            <span
              className="font-bold flex items-center after:content-['Mindustry_Calculator']"
              style={{}}
            ></span>
          </div>
        </Link>

        <div className="flex items-center">
          <div
            className="relative w-max flex items-center cursor-pointer overflow-hidden p-1 rounded-full hover:bg-surface-a20 duration-100"
            onClick={(event) => {
              rippleEffect(event);
              setTheme((prev) => (prev == "dark" ? "light" : "dark"));
            }}
          >
            {theme == "dark" ? (
              <div>
                <LightMode width="1.5rem" height="1.5rem" />
              </div>
            ) : (
              <div>
                <DarkMode width="1.5rem" height="1.5rem" />
              </div>
            )}
          </div>
        </div>
      </header>

      <nav
        ref={navigation}
        className="w-full flex bg-background relative border-b border-surface-a30 z-10"
      >
        <div
          ref={arrowLeft}
          className="absolute cursor-pointer z-20 hidden"
          onClick={() => {
            if (tabContainer.current) {
              tabContainer.current.scrollTo({ left: 0, behavior: "smooth" });
            }
          }}
        >
          <ArrowLeft width="2rem" height="2.5rem" />
        </div>
        <div
          ref={tabContainer}
          className="overflow-auto scrollbar-none"
          onScroll={updateNavigationArrow}
        >
          <div
            ref={tabGroup}
            className="relative flex w-max"
            onMouseEnter={() => {
              setTimeout(() => {
                if (cursorIndicator.current)
                  cursorIndicator.current.classList.add(
                    "transition-all",
                    "duration-200"
                  );
              }, 100);
            }}
            onMouseLeave={() => {
              if (cursorIndicator.current)
                cursorIndicator.current.classList.remove(
                  "transition-all",
                  "duration-200"
                );
            }}
          >
            <div ref={cursorIndicator} className="fixed h-11 p-1">
              <div className="h-full w-full bg-surface-a10 rounded-md"></div>
            </div>

            <Tab name="target">
              <div
                className="flex gap-1 items-center"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <CustomImage name={target} size={28} />
                {target}
              </div>
            </Tab>

            {Object.entries({
              Factory: "/",
              Visualize: "/visualize",
              Settings: "/settings",
              About: "/about",
            }).map(([tabName, href]) => (
              <Tab key={tabName} name={tabName}>
                <Link href={href} className="flex items-center">
                  {tabName}
                </Link>
              </Tab>
            ))}

            <div
              ref={underline}
              className="fixed bottom-0 border-b-2 border-foreground left-0 transition-all duration-100"
            ></div>
          </div>
        </div>
        <div
          ref={arrowRight}
          className="absolute cursor-pointer z-20 right-0 hidden"
          onClick={() => {
            if (tabContainer.current) {
              tabContainer.current.scrollTo({
                left: tabContainer.current.scrollWidth - window.innerWidth,
                behavior: "smooth",
              });
            }
          }}
        >
          <ArrowRight width="2rem" height="2.5rem" />
        </div>
      </nav>
      {navigation.current && (
        <Dropdown
          navigation={navigation.current}
          show={showDropdown}
          setShow={setShowDropdown}
        />
      )}
    </div>
  );
}

const Dropdown = ({
  navigation,
  show,
  setShow,
}: {
  navigation: HTMLDivElement;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const settings = useContext(SettingsContext).settingsState[0];
  const target = useContext(TargetContext).target;
  const setTarget = useContext(TargetContext).setTarget;
  const dropdown = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const cursorIndicator = useRef<HTMLDivElement | null>(null);

  const updateDropdown = React.useCallback(() => {
    if (dropdown.current && container.current) {
      const navigationRect = navigation.getBoundingClientRect();
      let top = navigationRect.y + navigationRect.height;

      if (window.scrollY >= navigationRect.height) {
        top -= navigationRect.y;
      }

      const headBarHeight = 48;
      const containerRect = container.current.getBoundingClientRect();
      let height = "0";
      if (show) {
        height = containerRect.height + 2 + "px";
        if (
          containerRect.height + navigationRect.y + navigationRect.height >
          window.innerHeight
        ) {
          height =
            window.innerHeight -
            headBarHeight -
            navigationRect.height -
            4 +
            "px";
          if (window.scrollY > 0 && window.scrollY < navigationRect.height) {
            height =
              window.innerHeight -
              headBarHeight -
              4 -
              navigationRect.height +
              window.scrollY +
              2 +
              "px";
          } else if (window.scrollY >= navigationRect.height) {
            height = window.innerHeight - headBarHeight - 4 + 2 + "px";
          }
        }
      } else {
        height = "0";
      }

      let width = "";
      if (show) {
        width = window.innerWidth - 8 + "px";
      }

      dropdown.current.style.width = width;
      dropdown.current.style.height = height;
      dropdown.current.style.top = top + "px";
    }
  }, [navigation, show]);

  useEffect(() => updateDropdown(), [show, updateDropdown]);

  useEffect(() => {
    window.addEventListener("scroll", updateDropdown);
    window.addEventListener("resize", updateDropdown);

    return () => {
      window.removeEventListener("scroll", updateDropdown);
      window.removeEventListener("resize", updateDropdown);
    };
  }, [updateDropdown]);

  return (
    <div
      ref={dropdown}
      className={`fixed flex z-10 left-1 max-w-min max-h-min overflow-hidden`}
      style={{ transition: "height .3s linear" }}
    >
      <div
        ref={cursorIndicator}
        className={`fixed bg-surface-a20 rounded-md transition-all ${!show && "hidden"}`}
      ></div>
      <div className="overflow-auto bg-surface-a10 border border-surface-a30 rounded-b-md">
        <div ref={container} className="p-2 w-max h-max">
          {Object.values(ResourceGroupEnum).map((group) => (
            <React.Fragment key={group}>
              <p className="font-bold">{group}</p>
              <hr />
              <div className="grid grid-cols-4 gap-1">
                {Object.values(ResourceEnum).map((resourceName) => {
                  const resource = getResource(resourceName);
                  if (!resource) return;
                  if (!resource.inGameModes.includes(settings.gameMode)) return;
                  if (!resource.group.includes(group)) return;

                  return (
                    <div
                      key={resourceName}
                      className={`p-1 z-10 cursor-pointer rounded-md transition-colors duration-100 ${target == resourceName && "bg-primary"}`}
                      onClick={() => {
                        setTarget(resourceName);
                        setShow(false);
                      }}
                      onMouseEnter={(event) => {
                        if (cursorIndicator.current) {
                          const target = event.target;
                          const rect = (
                            target as HTMLElement
                          ).getBoundingClientRect();
                          const style = cursorIndicator.current.style;
                          style.top = rect.y + "px";
                          style.left = rect.x + "px";
                          style.width = rect.width + "px";
                          style.height = rect.height + "px";
                          style.opacity = "1";
                        }
                      }}
                      onMouseLeave={() => {
                        if (cursorIndicator.current) {
                          cursorIndicator.current.style.opacity = "0";
                        }
                      }}
                    >
                      <CustomImage name={resourceName} />
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
