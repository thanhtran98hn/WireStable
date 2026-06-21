"use client";

import { useContext } from "react";
import { ModalContext, ModalContextValue } from "@/components/modal/ModalContext";

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
