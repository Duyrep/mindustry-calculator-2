import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function Dialog({
  children,
  showState,
  className,
}: {
  children: React.ReactNode;
  showState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  className?: string;
}) {
  const { t } = useTranslation();
  const [show, setShow] = showState;
  const dialog = useRef<HTMLDivElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);

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

  return (
    <div
      ref={dialog}
      className={`fixed flex items-center justify-center sm:p-8 z-10 top-0 right-0 w-screen h-screen backdrop-blur-xs transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (menu.current && !menu.current.contains(target)) {
          setShow(false);
        }
      }}
    >
      <div
        ref={menu}
        className={
          "flex flex-col gap-1 h-min max-h-full bg-surface-a10 p-2 rounded-md overflow-auto " +
          className
        }
      >
        {children}
        <hr />
        <div className="flex justify-end w-full">
          <button
            className="bg-primary py-1 px-2 rounded-md text-base"
            onClick={() => setShow(false)}
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
