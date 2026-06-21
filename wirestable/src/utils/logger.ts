export type LogCategory = "SECURITY" | "AUTH" | "COMPLIANCE" | "TRANSACTION" | "API" | "SYSTEM";
export type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogPayload {
  category: LogCategory;
  event: string;
  message: string;
  ip?: string;
  metadata?: Record<string, any>;
}

export const logger = {
  log(level: LogLevel, payload: LogPayload) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category: payload.category,
      event: payload.event,
      message: payload.message,
      ip: payload.ip || "unknown",
      // Strip potentially sensitive secrets from metadata before logging
      metadata: payload.metadata ? this.sanitize(payload.metadata) : undefined,
    };
    
    // Print to stdout as a single JSON line for log collectors (Datadog, Cloudflare, etc.)
    console.log(JSON.stringify(logEntry));
  },

  info(payload: LogPayload) {
    this.log("INFO", payload);
  },

  warn(payload: LogPayload) {
    this.log("WARN", payload);
  },

  error(payload: LogPayload) {
    this.log("ERROR", payload);
  },

  // Helper to remove keys like "pin", "password", "apiKey", "secret", "privateKey"
  sanitize(obj: Record<string, any>): Record<string, any> {
    const copy = { ...obj };
    const forbidden = ["pin", "password", "token", "key", "secret", "private", "api_key", "entity_secret"];
    
    for (const key of Object.keys(copy)) {
      if (forbidden.some((f) => key.toLowerCase().includes(f))) {
        copy[key] = "[REDACTED]";
      } else if (typeof copy[key] === "object" && copy[key] !== null) {
        copy[key] = this.sanitize(copy[key]);
      }
    }
    return copy;
  },
};
