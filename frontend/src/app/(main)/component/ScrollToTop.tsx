"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
  const element = document.getElementById("main-content");

  element?.scrollTo({
    top: 0,
    behavior: "instant",
  });
}, [pathname]);

  return null;
}