"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { VoiceState } from "@/types";

/**
 * Hook for browser-native voice recognition (Web Speech API).
 * Provides real-time transcription that feeds into the chat input.
 */
export function useVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    transcript: "",
    error: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US"; // Support English, can be extended

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceState((prev: VoiceState) => ({ ...prev, transcript }));
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setVoiceState((prev: VoiceState) => ({
          ...prev,
          isListening: false,
          error:
            event.error === "not-allowed"
              ? "Microphone access denied. Please allow microphone access."
              : event.error === "no-speech"
              ? "No speech detected. Please try again."
              : `Voice recognition error: ${event.error}`,
        }));
      };

      recognition.onend = () => {
        setVoiceState((prev) => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setVoiceState((prev) => ({
        ...prev,
        error: "Voice recognition is not supported in this browser.",
      }));
      return;
    }

    try {
      setVoiceState({ isListening: true, transcript: "", error: null });
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start recognition:", error);
      setVoiceState((prev) => ({
        ...prev,
        isListening: false,
        error: "Failed to start voice recognition.",
      }));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    setVoiceState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const toggleListening = useCallback(() => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState.isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setVoiceState((prev) => ({ ...prev, transcript: "", error: null }));
  }, []);

  return {
    ...voiceState,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}

// Extend Window interface for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
