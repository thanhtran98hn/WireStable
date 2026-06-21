"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { LoadingContextValue, LoadingTask, LoadingCategory } from "@/types/loading";
import { LoadingRouteTransition } from "./LoadingComponents";

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<LoadingTask[]>([]);
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);

  // Clean stale tasks automatically (e.g., older than 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTasks((prev) => prev.filter((t) => now - t.startTime < 300000));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const startTask = useCallback(
    (
      category: LoadingCategory,
      title: string,
      options?: { id?: string; description?: string; estimatedDuration?: number }
    ) => {
      const id = options?.id || `${category}-${Math.random().toString(36).substring(2, 9)}`;
      const newTask: LoadingTask = {
        id,
        category,
        title,
        description: options?.description,
        progress: 0,
        startTime: Date.now(),
        estimatedDuration: options?.estimatedDuration,
      };

      setTasks((prev) => {
        // Prevent duplicate tasks by id
        if (prev.some((t) => t.id === id)) return prev;
        return [...prev, newTask];
      });

      // Perceived progressive loading indicator
      if (options?.estimatedDuration) {
        const duration = options.estimatedDuration;
        const tick = 150; // increment interval
        let currentProgress = 0;
        
        const timer = setInterval(() => {
          setTasks((prev) => {
            const index = prev.findIndex((t) => t.id === id);
            if (index === -1) {
              clearInterval(timer);
              return prev;
            }
            
            // Asymptotic curve: progresses fast initially, decelerates as it approaches 95%
            const task = prev[index];
            const elapsed = Date.now() - task.startTime;
            const progressRatio = Math.min(elapsed / duration, 1);
            
            // Logarithmic perceived speed progress
            currentProgress = Math.floor(95 * (1 - Math.pow(2.718, -3 * progressRatio)));
            
            const updated = [...prev];
            updated[index] = { ...task, progress: currentProgress };
            return updated;
          });
        }, tick);
      }

      return id;
    },
    []
  );

  const updateTaskProgress = useCallback((id: string, progress: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, progress: Math.min(Math.max(progress, 0), 100) } : t))
    );
  }, []);

  const endTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCategory = useCallback((category: LoadingCategory) => {
    setTasks((prev) => prev.filter((t) => t.category !== category));
  }, []);

  const activeApiCount = tasks.filter((t) => t.category === "api").length;

  const value: LoadingContextValue = {
    tasks,
    isRouteTransitioning,
    activeApiCount,
    startTask,
    updateTaskProgress,
    endTask,
    clearCategory,
    setRouteTransitioning: setIsRouteTransitioning,
  };

  return (
    <LoadingContext.Provider value={value}>
      <LoadingRouteTransition active={isRouteTransitioning} />
      {children}
    </LoadingContext.Provider>
  );
}


export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
