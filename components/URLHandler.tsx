"use client";

import { TargetContext } from "@/context/TargetContext";
import {
  ItemEnum,
} from "@/types/data/vanilla-v8";
import { generateURL, readURL } from "@/types/utils";
import { usePathname } from "next/navigation";
import React, { useContext, useEffect } from "react";

export default function URLHandler({
  children,
}: {
  children: React.ReactNode[];
}) {
  const target = useContext(TargetContext).target;
  const setTarget = useContext(TargetContext).setTarget;
  const productsPerSec = useContext(TargetContext).productsPerSec;
  const setProductsPerSec = useContext(TargetContext).setProductsPerSec;
  const numOfBuilding = useContext(TargetContext).numOfBuilding;
  const setNUmOfBuilding = useContext(TargetContext).setNUmOfBuilding;
  const calculationMode = useContext(TargetContext).calculationMode;
  const setCalculationMode = useContext(TargetContext).setCalculationMode;
  const pathname = usePathname()

  useEffect(() => {
    const url = readURL();
    if (
      url.target &&
      Object.values(ItemEnum).includes(
        url.target as ItemEnum
      ) &&
      (url.f || url.r)
    ) {
      setTarget(url.target as ItemEnum);
      if (url.f) {
        setNUmOfBuilding(url.f);
        setCalculationMode("building")
      } else if (url.r) {
        setProductsPerSec(url.r)
        setCalculationMode("itemsPerTime")
      }
    }
  }, []);

  useEffect(() => {
    const url = generateURL(target, calculationMode === "building" ? numOfBuilding : undefined, calculationMode === "itemsPerTime" ? productsPerSec : undefined)

    window.history.replaceState({}, "", url)
  }, [target, productsPerSec, numOfBuilding, calculationMode, pathname])

  return children;
}
