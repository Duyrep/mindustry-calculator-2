import { SettingsProvider } from "@/context/SettingsContext";
import "./globals.css";
import Header from "@/components/Header";
import { TargetProvider } from "@/context/TargetContext";
import InputTarget from "@/components/InputTarget";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <Header />
            <div className="p-2">
              {children}
            </div>
          </TargetProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
