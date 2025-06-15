"use client";

import { useEffect, useRef, useState } from "react";
import { rippleEffect } from "./RippleEffect";
import { Triangle } from "./Icons";

export default function CustomDetails({
  summary,
  children,
  onChange,
  defaultOpen = false,
  className,
}: Readonly<{
  summary: string;
  children: React.ReactNode;
  onChange?: (open: boolean, target: HTMLDivElement) => void;
  defaultOpen?: boolean;
  className?: string;
}>) {
  const [open, setOpen] = useState(defaultOpen);
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onChange && target.current) onChange(open, target.current);
  }, [open, onChange]);

  return (
    <div ref={target} className={`${className} bg-surface-a10 p-1`}>
      <div
        className="flex gap-1 items-center font-bold cursor-pointer select-none hover:bg-surface-a20 rounded-md p-1 duration-100 overflow-hidden relative"
        onClick={(event) => {
          setOpen((prev) => !prev);
          rippleEffect(event);
        }}
      >
        <div>
          <Triangle
            width="1rem"
            height="1rem"
            className={`${
              open ? "animate-rotate90Effect" : "animate-rotate90ReverseEffect"
            } origin-[256px_256px]`}
          />
        </div>
        <span>{summary}</span>
      </div>
      <div
        className={`${
          open ? "h-max" : "h-0"
        } overflow-x-auto overflow-y-hidden transition-all duration-200`}
      >
        {children}
      </div>
    </div>
  );
}
