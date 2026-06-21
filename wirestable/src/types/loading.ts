export type LoadingCategory =
  | "route"
  | "api"
  | "ai"
  | "blockchain"
  | "upload"
  | "download"
  | "workflow";

export interface LoadingTask {
  id: string;
  category: LoadingCategory;
  title: string;
  description?: string;
  progress?: number; // 0 to 100
  startTime: number;
  estimatedDuration?: number; // ms, for perceived progress calculations
}

export type MotionDuration = "ultra-fast" | "fast" | "normal" | "slow";
export type MotionCurve = "standard" | "smooth" | "spring" | "entrance" | "exit";
export type MotionPreset =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "scale"
  | "shimmer"
  | "pulse"
  | "slide"
  | "skeleton"
  | "progress";

export interface LoadingState {
  tasks: LoadingTask[];
  isRouteTransitioning: boolean;
  activeApiCount: number;
}

export interface LoadingContextValue extends LoadingState {
  startTask: (
    category: LoadingCategory,
    title: string,
    options?: { id?: string; description?: string; estimatedDuration?: number }
  ) => string; // returns taskId
  updateTaskProgress: (id: string, progress: number) => void;
  endTask: (id: string) => void;
  clearCategory: (category: LoadingCategory) => void;
  setRouteTransitioning: (active: boolean) => void;
}
