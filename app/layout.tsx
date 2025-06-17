"use client";

import { SettingsProvider } from "@/context/SettingsContext";
import "@xyflow/react/dist/style.css";
import "./globals.css";
import Header from "@/components/Header";
import { TargetProvider } from "@/context/TargetContext";
import { usePathname } from "next/navigation";
import InputTarget from "@/components/InputTarget";
import FactoryVisualize from "@/components/FactoryVisualize";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import URLHandler from "@/components/URLHandler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang="en" className="dark" translate="no">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mindustry Calculator</title>
      </head>
      <body>
        <SettingsProvider>
          <TargetProvider>
            <ReactFlowProvider>
              <URLHandler>
                <Header />
                <div className="p-2">
                  {["/", "/visualize"].includes(pathname) && <InputTarget />}
                  {windowWidth >= 1280 && pathname == "/" ? (
                    <div>
                      <FactoryVisualize />
                    </div>
                  ) : (
                    children
                  )}
                </div>
                {/* <div className="p-2">{children}</div> */}
              </URLHandler>
            </ReactFlowProvider>
          </TargetProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
