"use client";

import React from "react";
import { ModalProvider as ContextProvider } from "./ModalContext";
import { useModal } from "@/hooks/useModal";
import { ModalPortal, ModalErrorBoundary, ModalOverlay } from "./ModalComponents";
import {
  ConfirmationModal,
  ProcessingModal,
  SuccessModal,
  ErrorModal,
  WarningModal,
  TransactionModal,
  SystemModal,
} from "./ModalVariants";

function ModalRenderer() {
  const { stack, closeModal } = useModal();

  if (stack.length === 0) return null;

  return (
    <ModalPortal>
      {stack.map((modal, index) => {
        const handleClose = () => {
          closeModal(modal.id);
        };

        const key = modal.id;
        const zIndexClass = `z-[${100 + index * 10}]`;

        // Render based on modal type
        return (
          <ModalErrorBoundary key={key} onClose={handleClose}>
            {modal.type === "confirmation" && (
              <ConfirmationModal
                {...(modal.props as any)}
                isOpen={true}
                onClose={handleClose}
              />
            )}
            {modal.type === "processing" && (
              <ProcessingModal
                {...(modal.props as any)}
                isOpen={true}
                onClose={handleClose}
              />
            )}
            {modal.type === "success" && (
              <SuccessModal
                {...(modal.props as any)}
                isOpen={true}
                onClose={handleClose}
              />
            )}
            {modal.type === "error" && (
              <ErrorModal
                {...(modal.props as any)}
                isOpen={true}
                onClose={handleClose}
              />
            )}
            {modal.type === "warning" && (
              <WarningModal
                {...(modal.props as any)}
                isOpen={true}
                onClose={handleClose}
              />
            )}
            {modal.type === "transaction" && (
              <TransactionModal
                {...(modal.props as any)}
                isOpen={true}
                onClose={handleClose}
              />
            )}
            {modal.type === "system" && (
              <SystemModal
                {...(modal.props as any)}
                isOpen={true}
                onClose={handleClose}
              />
            )}
            {modal.type === "custom" && (
              <ModalOverlay isOpen={true} onClose={handleClose}>
                <div className={zIndexClass}>{(modal.props as any).content}</div>
              </ModalOverlay>
            )}
          </ModalErrorBoundary>
        );
      })}
    </ModalPortal>
  );
}

export function ModalProviderGlobal({ children }: { children: React.ReactNode }) {
  return (
    <ContextProvider>
      {children}
      <ModalRenderer />
    </ContextProvider>
  );
}
export { useModal };
