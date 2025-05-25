"use client"

import { useEffect, useRef, useState } from "react";
import { rippleEffect } from "./RippleEffect";

export default function CustomDetails({
  summary,
  children,
  onChange,
  defaultOpen=false,
  className,
}: Readonly<{
  summary: string;
  children: React.ReactNode;
  onChange?: (open: boolean, target: HTMLDivElement) => void;
  defaultOpen?: boolean
  className?: string;
}>) {
  const [open, setOpen] = useState(defaultOpen);
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onChange && target.current) onChange(open, target.current);
  }, [open, onChange])

  return (
    <div ref={target} className={`${className} bg-surface-a10 p-1`}>
      <div
        className="flex gap-1 items-center font-bold cursor-pointer select-none hover:bg-surface-a20 rounded-md p-1 duration-100 overflow-hidden relative"
        onClick={(event) => {
          setOpen(prev => !prev)
          rippleEffect(event)
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1rem" height="1rem" viewBox="0 0 512 512" version="1.1">
          <path className={`${open ? "animate-rotate90Effect" : "animate-rotate90ReverseEffect"} origin-[256px_256px]`} fill="currentColor" d="M246.312928,5.62892705 C252.927596,9.40873724 258.409564,14.8907053 262.189374,21.5053731 L444.667042,340.84129 C456.358134,361.300701 449.250007,387.363834 428.790595,399.054926 C422.34376,402.738832 415.04715,404.676552 407.622001,404.676552 L42.6666667,404.676552 C19.1025173,404.676552 7.10542736e-15,385.574034 7.10542736e-15,362.009885 C7.10542736e-15,354.584736 1.93772021,347.288125 5.62162594,340.84129 L188.099293,21.5053731 C199.790385,1.04596203 225.853517,-6.06216498 246.312928,5.62892705 Z">
          </path>
        </svg>
        <span>{summary}</span>
      </div>
      <div className={`${open ? "h-max" : "h-0"} overflow-hidden transition-all duration-200`}>{children}</div>
    </div>
  )
}