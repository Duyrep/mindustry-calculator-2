"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, DarkMode, LightMode, Search } from "./Icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SettingsContext } from "@/context/SettingsContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { rippleEffect } from "./RippleEffect";
import { TargetContext } from "@/context/TargetContext";
import CustomImage from "./CustomImage";
import {
  GameModeEnum,
  ItemGroupEnum,
  ItemEnum
} from "@/types/data/vanilla-v8";
import Dialog from "./Dialog";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";
import { getItem } from "@/types/utils";

export default function Header() {
  const pathName = usePathname();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext).settingsState[0];
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
  const [showDialog, setShowDialog] = useState(false);

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
          cursorIndicator.current.style.opacity = "1";
          cursorIndicator.current.style.top = rect.y + "px";
          cursorIndicator.current.style.left = rect.x + "px";
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
        "relative cursor-pointer overflow-hidden flex items-center" + className
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

  const updateUnderline = (pathName: string) => {
    if (!tabRefs.current) return;
    Object.keys(tabRefs.current).forEach((tabName) => {
      if (pathName == tabName) {
        if (
          tabRefs.current[tabName] &&
          underline.current &&
          tabContainer.current &&
          navigation.current
        ) {
          const rect = tabRefs.current[tabName].getBoundingClientRect();
          underline.current.style.transform = `translateX(${rect.x}px)`;
          underline.current.style.width = `${rect.width}px`;
        }
      }
    });
  };

  useEffect(() => {
    updateUnderline(window.location.pathname);
  }, [pathName, target]);

  useEffect(() => {
    updateNavigationArrow();
  }, [target]);

  useEffect(() => {
    setTimeout(() => updateUnderline(window.location.pathname), 300);
  }, [settings, pathName]);

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
      if (cursorIndicator.current) {
        cursorIndicator.current.style.opacity = "0";
      }
    };
    const updateUnderlineOnResize = () =>
      updateUnderline(window.location.pathname);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateNavigationArrow);
    window.addEventListener("resize", updateUnderlineOnResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateNavigationArrow);
      window.removeEventListener("resize", updateUnderlineOnResize);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
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
          className="flex w-full bg-background relative border-b border-surface-a30 z-10"
        >
          <div
            ref={underline}
            className="absolute bottom-0 border-b-2 h-min z-10 border-foreground left-0 transition-transform duration-100"
          ></div>
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
            onScroll={() => {
              updateNavigationArrow();
              updateUnderline(window.location.pathname);
              if (cursorIndicator.current) {
                cursorIndicator.current.style.opacity = "0";
              }
            }}
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
                  className="flex gap-1 items-center px-4 py-2"
                  onClick={() => setShowDialog((prev) => !prev)}
                >
                  <CustomImage name={target} size={28} />
                  {t(target)}
                </div>
                <div className="flex items-center">
                  <div className="border-r border-surface-a30 h-6"></div>
                </div>
              </Tab>

              {Object.entries({
                Factory: "/",
                Visualize: "/visualize",
                Settings: "/settings",
                About: "/about",
              }).map(([tabName, href]) => (
                <Tab key={tabName} name={href}>
                  <Link
                    href={href}
                    className={`flex items-center px-4 py-2 ${
                      tabName == "Visualize" && "xl:hidden"
                    }`}
                  >
                    {t(tabName)}
                  </Link>
                </Tab>
              ))}
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
        <SelectionDialog showState={[showDialog, setShowDialog]} />
      </div>
    </I18nextProvider>
  );
}

const SelectionDialog = ({
  showState,
}: {
  showState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}) => {
  const { t } = useTranslation();
  const setTarget = useContext(TargetContext).setTarget;
  const target = useContext(TargetContext).target;
  const settings = useContext(SettingsContext).settingsState[0];
  const [show, setShow] = showState;
  const [searchItem, setSearchItem] = useState("");
  const cursorIndicator = useRef<HTMLDivElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (dialog.current && show) {
      dialog.current.style.display = "";
    } else {
      setTimeout(() => {
        if (dialog.current) {
          dialog.current.style.display = "none";
        }
      }, 200);
    }
  }, [show]);

  const searchItems = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return Object.entries(itemsRef.current)
      .filter(([key]) => key.toLowerCase().includes(lowerQuery))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, HTMLDivElement | null>);
  };

  return (
    <Dialog
      showState={showState}
      className="w-full h-[calc(100vh/2)] max-h-6xl max-w-6xl overflow-hidden"
    >
      <div
        ref={cursorIndicator}
        className={`fixed z-10 bg-surface-a30 rounded-md transition-all max-[400px]:hidden ${
          !show && "hidden"
        }`}
      ></div>
      <div className="flex items-center bg-surface-a20 rounded-md py-1 px-2">
        <span>
          <Search width="1.4rem" height="1.4rem" />
        </span>
        <input
          type="text"
          placeholder="Search by name"
          onChange={(event) => {
            setSearchItem(event.target.value);
          }}
          className="w-full px-2 py-1"
        />
      </div>
      <div className="h-full overflow-auto">
        {Object.values(ItemGroupEnum).map((group) => {
          const items = Object.values(ItemEnum).reduce<React.ReactNode[]>((acc, gameObjectName) => {
            const gameObject = getItem(gameObjectName);
            if (!gameObject) return acc;
            if (!gameObject.group.includes(group)) return acc;
            if (
              !gameObject.inGameModes.includes(settings.gameMode) &&
              settings.gameMode !== GameModeEnum.Any
            )
              return acc;

            if (searchItem.length > 0) {
              const results = searchItems(searchItem);
              if (!Object.keys(results).includes(gameObjectName)) return acc;
            }

            acc.push(
              <div
          ref={(el) => {
            itemsRef.current[gameObjectName] = el;
          }}
          key={gameObjectName}
          className={`flex w-min text-sm items-center p-1 z-10 cursor-pointer rounded-md transition-colors duration-100 ${
            target == gameObjectName && "bg-primary"
          }`}
          onClick={() => {
            setTarget(gameObjectName);
            setShow(false);
          }}
          onMouseEnter={(event) => {
            if (cursorIndicator.current) {
              const target = event.currentTarget;
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
          <CustomImage name={gameObjectName} />
          &nbsp;
          <span>{t(gameObjectName)}</span>
              </div>
            );
            return acc;
          }, []);

          if (items.length == 0) return;

          return (
            <React.Fragment key={group}>
              <p className="font-bold">{group}</p>
              <hr />
              <div className="flex flex-wrap gap-1 p-1">{items}</div>
            </React.Fragment>
          );
        })}
      </div>
    </Dialog>
  );
};
