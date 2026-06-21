export type ModalPriority = "P0" | "P1" | "P2" | "P3";

export type ModalType =
  | "confirmation"
  | "processing"
  | "success"
  | "error"
  | "warning"
  | "transaction"
  | "system"
  | "custom";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export interface ConfirmationModalProps extends BaseModalProps {
  variant?: "neutral" | "warning" | "destructive";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export interface ProcessingModalProps extends BaseModalProps {
  status?: string;
  progress?: number; // 0 to 100
  estimatedTime?: string;
  steps?: { label: string; status: "idle" | "running" | "done" | "error" }[];
  currentStepIndex?: number;
}

export interface SuccessModalProps extends BaseModalProps {
  autoCloseDelay?: number; // ms, optional
  continueLabel?: string;
  onContinue?: () => void;
  detailsLabel?: string;
  onViewDetails?: () => void;
  showCelebration?: boolean;
}

export interface ErrorModalProps extends BaseModalProps {
  error: Error | string | unknown;
  retryLabel?: string;
  onRetry?: () => void;
  supportLabel?: string;
  onSupport?: () => void;
  reportLabel?: string;
  onReport?: () => void;
}

export interface WarningModalProps extends BaseModalProps {
  riskText: string;
  impactText: string;
  consequenceText: string;
  acknowledgeLabel?: string;
  onAcknowledge: () => void;
}

export interface TransactionModalProps extends BaseModalProps {
  txState:
    | "preparing"
    | "awaiting_signature"
    | "pending"
    | "confirming"
    | "success"
    | "failed"
    | "rejected"
    | "expired"
    | "timeout";
  txHash?: string;
  explorerUrl?: string;
  gasStatus?: "low" | "average" | "high" | "critical";
  errorMessage?: string;
  onRetry?: () => void;
}

export interface SystemModalProps extends BaseModalProps {
  variant: "maintenance" | "downtime" | "migration" | "security_alert";
  criticalTime?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface CustomModalProps extends BaseModalProps {
  content: React.ReactNode;
}

export type ModalPropsMap = {
  confirmation: Omit<ConfirmationModalProps, "isOpen" | "onClose">;
  processing: Omit<ProcessingModalProps, "isOpen" | "onClose">;
  success: Omit<SuccessModalProps, "isOpen" | "onClose">;
  error: Omit<ErrorModalProps, "isOpen" | "onClose">;
  warning: Omit<WarningModalProps, "isOpen" | "onClose">;
  transaction: Omit<TransactionModalProps, "isOpen" | "onClose">;
  system: Omit<SystemModalProps, "isOpen" | "onClose">;
  custom: Omit<CustomModalProps, "isOpen" | "onClose">;
};

export interface ModalInstance<T extends ModalType = ModalType> {
  id: string;
  type: T;
  priority: ModalPriority;
  props: ModalPropsMap[T];
  preventDuplicate?: boolean;
  onClose?: () => void;
  allowStacking?: boolean;
}

export interface ModalState {
  stack: ModalInstance[];
  queue: ModalInstance[];
}
