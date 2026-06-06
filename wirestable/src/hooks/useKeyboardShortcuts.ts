"use client";

import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onTogglePalette: () => void;
  onClosePalette: () => void;
  isOpen: boolean;
}

export function useKeyboardShortcuts({
  onTogglePalette,
  onClosePalette,
  isOpen
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle palette: Cmd + K or Ctrl + K
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onTogglePalette();
      }

      // Close palette: Escape
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        onClosePalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTogglePalette, onClosePalette, isOpen]);
}
