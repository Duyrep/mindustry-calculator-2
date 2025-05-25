"use client"

import Image from "next/image";
import { DarkMode, LightMode } from "./Icons";
import { useContext, useEffect, useRef } from "react";
import { SettingsContext } from "@/context/SettingsContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { rippleEffect } from "./RippleEffect";
import Dropdown from "./Dropdown";
import { TargetContext } from "@/context/TargetContext";

export default function Header() {
  const pathName = usePathname();
  const target = useContext(TargetContext).target
  const cursorIndicator = useRef<HTMLDivElement | null>(null);
  const underline = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, (HTMLAnchorElement | null)>>({});
  const tabContainer = useRef<HTMLDivElement | null>(null);
  const tabContainerWrapper = useRef<HTMLDivElement | null>(null);

  const [theme, setTheme] = useContext(SettingsContext).themeState;

  const Tab = ({ name, href, className }: { name: string, href: string, className?: string }) => (
    <Link
      ref={(el) => { tabRefs.current[href] = el; }}
      onClick={(event) => rippleEffect(event)}
      onMouseEnter={(event) => {
        const target = event.currentTarget as HTMLElement
        if (cursorIndicator.current && tabContainer.current) {
          const rect = target.getBoundingClientRect();
          const scrollLeft = tabContainer.current.scrollLeft
          cursorIndicator.current.style.opacity = "1"
          cursorIndicator.current.style.transform = `translateX(${rect.x + scrollLeft}px)`;
          cursorIndicator.current.style.width = `${rect.width}px`
        }
      }}
      onMouseLeave={() => { if (cursorIndicator.current) cursorIndicator.current.style.opacity = "0" }}
      onMouseUp={() => { if (cursorIndicator.current) cursorIndicator.current.style.opacity = "0" }}
      className={"relative cursor-pointer px-4 p-2 overflow-hidden " + className}
      href={href}
    ><span className="z-10">{name}</span></Link>
  )

  useEffect(() => {
    if (!tabRefs.current) return
    Object.keys(tabRefs.current).forEach((tabName) => {
      if (pathName == tabName) {
        if (tabRefs.current[tabName] && underline.current && tabContainer.current) {
          const rect = tabRefs.current[tabName].getBoundingClientRect();
          const scrollLeft = tabContainer.current.scrollLeft
          underline.current.style.transform = `translateX(${rect.x + scrollLeft}px)`;
          underline.current.style.width = `${rect.width}px`
        }
      }
    })
  }, [pathName, target])

  useEffect(() => {
    const handleScroll = () => {
      if (tabContainerWrapper.current) {
        const div = tabContainerWrapper.current;
        const height = div.getBoundingClientRect().height;
        if (window.scrollY >= 88 - height) {
          div.style.position = "fixed";
          div.style.top = "0";
          div.style.left = "0";
        } else {
          div.style.position = "";
          div.style.top = "";
          div.style.right = "";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header>

      <nav
        className="h-[var(--nav-height)] flex flex-col select-none"
      >

        <div className="flex justify-between px-4 py-2 bg-primary dark:bg-surface-a10">
          <div className="h-full flex gap-4 items-center">
            <div className="flex gap-1">
              <div className="flex items-center w-6 h-6"><Image src={"/favicon.ico"} width={28} height={28} alt="icon" draggable="false" /></div>
              <span className="font-bold flex items-center after:content-['Mindustry_Calculator']"></span>
            </div>
          </div>

          <div
            className="relative flex items-center cursor-pointer overflow-hidden p-1 rounded-full hover:bg-surface-a20 duration-100"
            onClick={(event) => {
              rippleEffect(event)
              setTheme(prev => prev == "dark" ? "light" : "dark")
            }}
          >
            {theme == "dark" ? <LightMode width="1.5rem" height="1.5rem" /> : <DarkMode width="1.5rem" height="1.5rem" />}
          </div>
        </div>

        <div ref={tabContainerWrapper} className="w-full bg-background relative border-b border-surface-a30 z-10">
          <div
            ref={tabContainer}
            className="overflow-auto scrollbar-none"
          >
            <div
              className="relative flex w-max"
              onMouseEnter={() => {
                setTimeout(() => { if (cursorIndicator.current) cursorIndicator.current.classList.add("transition-all", "duration-200") }, 100)
              }}
              onMouseLeave={() => { if (cursorIndicator.current) cursorIndicator.current.classList.remove("transition-all", "duration-200") }}
            >
              <div ref={cursorIndicator} className="absolute h-10 p-1">
                <div className="h-full w-full bg-surface-a10 rounded-md"></div>
              </div>

              <div
                className="flex"
                onMouseEnter={(event) => {
                  const target = event.currentTarget as HTMLElement
                  if (cursorIndicator.current && tabContainer.current) {
                    const rect = target.getBoundingClientRect();
                    const scrollLeft = tabContainer.current.scrollLeft
                    cursorIndicator.current.style.opacity = "1"
                    cursorIndicator.current.style.transform = `translateX(${rect.x + scrollLeft}px)`;
                    cursorIndicator.current.style.width = `${rect.width}px`
                  }
                }}
                onMouseLeave={() => { if (cursorIndicator.current) cursorIndicator.current.style.opacity = "0" }}
                onMouseUp={() => { if (cursorIndicator.current) cursorIndicator.current.style.opacity = "0" }}
              >
                <Dropdown />
              </div>

              <Tab name={"Factory"} href="/" />
              <Tab name={"Visualize"} href="/visualize" />
              <Tab name={"Settings"} href="/settings" />
              <Tab name={"About"} href="/about" />

              <div ref={underline} className="absolute bottom-0 border-b-2 border-foreground left-0 transition-all duration-100"></div>
            </div>
          </div>

        </div>

      </nav>
    </header>
  )
}