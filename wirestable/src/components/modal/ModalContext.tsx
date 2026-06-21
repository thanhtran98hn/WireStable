"use client";

import React, { createContext, useState, useCallback, useMemo } from "react";
import { ModalInstance, ModalType, ModalPropsMap, ModalPriority } from "@/types/modal";

export interface ModalContextValue {
  stack: ModalInstance[];
  queue: ModalInstance[];
  openModal: <T extends ModalType>(
    type: T,
    props: ModalPropsMap[T],
    options?: {
      id?: string;
      priority?: ModalPriority;
      preventDuplicate?: boolean;
      allowStacking?: boolean;
      onClose?: () => void;
    }
  ) => string;
  closeModal: (id?: string) => void;
  replaceModal: <T extends ModalType>(
    targetId: string,
    type: T,
    props: ModalPropsMap[T],
    options?: { priority?: ModalPriority; allowStacking?: boolean }
  ) => void;
  clearAll: () => void;
}

export const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const PRIORITY_MAP: Record<ModalPriority, number> = {
  P0: 0, // Critical
  P1: 1, // Blocking
  P2: 2, // Important
  P3: 3, // Informational
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ stack: ModalInstance[]; queue: ModalInstance[] }>({
    stack: [],
    queue: [],
  });

  const openModal = useCallback(<T extends ModalType>(
    type: T,
    props: ModalPropsMap[T],
    options?: {
      id?: string;
      priority?: ModalPriority;
      preventDuplicate?: boolean;
      allowStacking?: boolean;
      onClose?: () => void;
    }
  ): string => {
    const id = options?.id || `${type}-${Math.random().toString(36).substring(2, 9)}`;
    const priority = options?.priority || "P2";
    const preventDuplicate = options?.preventDuplicate ?? false;
    const allowStacking = options?.allowStacking ?? (priority === "P0");
    const onClose = options?.onClose;

    const newInstance: ModalInstance = {
      id,
      type,
      priority,
      props,
      preventDuplicate,
      allowStacking,
      onClose,
    };

    setState((prev) => {
      // 1. Prevent duplicate check
      if (preventDuplicate) {
        const isDuplicate =
          prev.stack.some((m) => m.type === type || m.id === id) ||
          prev.queue.some((m) => m.type === type || m.id === id);
        if (isDuplicate) {
          return prev; // Discard duplicate request
        }
      }

      // 2. Determine if it can go straight to stack or needs queue
      if (prev.stack.length === 0) {
        return {
          ...prev,
          stack: [newInstance],
        };
      }

      // If stacking is allowed
      if (allowStacking) {
        return {
          ...prev,
          stack: [...prev.stack, newInstance],
        };
      }

      // Otherwise, add to queue and sort by priority (highest priority first, which is lowest number)
      const unsortedQueue = [...prev.queue, newInstance];
      const sortedQueue = unsortedQueue.sort((a, b) => {
        const diff = PRIORITY_MAP[a.priority] - PRIORITY_MAP[b.priority];
        return diff; // FIFO for same priority, sorting handles priority differences
      });

      return {
        ...prev,
        queue: sortedQueue,
      };
    });

    return id;
  }, []);

  const closeModal = useCallback((id?: string) => {
    setState((prev) => {
      let targetInstance: ModalInstance | undefined;
      let newStack = [...prev.stack];
      let newQueue = [...prev.queue];

      if (id) {
        // Find target in stack
        targetInstance = prev.stack.find((m) => m.id === id);
        if (targetInstance) {
          newStack = prev.stack.filter((m) => m.id !== id);
        } else {
          // Find in queue
          targetInstance = prev.queue.find((m) => m.id === id);
          newQueue = prev.queue.filter((m) => m.id !== id);
        }
      } else {
        // Pop top of stack
        targetInstance = newStack.pop();
      }

      // Trigger callback if defined
      if (targetInstance?.onClose) {
        try {
          targetInstance.onClose();
        } catch (e) {
          console.error("Error in modal onClose callback", e);
        }
      }

      // If stack is empty and queue has items, pull the next blocking one into stack
      if (newStack.length === 0 && newQueue.length > 0) {
        const [nextModal, ...remainingQueue] = newQueue;
        newStack = [nextModal];
        newQueue = remainingQueue;
      }

      return {
        stack: newStack,
        queue: newQueue,
      };
    });
  }, []);

  const replaceModal = useCallback(<T extends ModalType>(
    targetId: string,
    type: T,
    props: ModalPropsMap[T],
    options?: { priority?: ModalPriority; allowStacking?: boolean }
  ) => {
    const priority = options?.priority || "P2";
    const allowStacking = options?.allowStacking ?? (priority === "P0");

    setState((prev) => {
      const isTargetInStack = prev.stack.some((m) => m.id === targetId);

      const updatedInstance: ModalInstance = {
        id: targetId,
        type,
        priority,
        props,
        allowStacking,
      };

      if (isTargetInStack) {
        const newStack = prev.stack.map((m) => (m.id === targetId ? updatedInstance : m));
        return {
          ...prev,
          stack: newStack,
        };
      } else {
        const newQueue = prev.queue.map((m) => (m.id === targetId ? updatedInstance : m));
        return {
          ...prev,
          queue: newQueue,
        };
      }
    });
  }, []);

  const clearAll = useCallback(() => {
    setState((prev) => {
      // Trigger all onClose events
      [...prev.stack, ...prev.queue].forEach((m) => {
        if (m.onClose) {
          try {
            m.onClose();
          } catch (e) {
            console.error("Error in modal onClose during clearAll", e);
          }
        }
      });
      return { stack: [], queue: [] };
    });
  }, []);

  const value = useMemo(
    () => ({
      stack: state.stack,
      queue: state.queue,
      openModal,
      closeModal,
      replaceModal,
      clearAll,
    }),
    [state.stack, state.queue, openModal, closeModal, replaceModal, clearAll]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}
