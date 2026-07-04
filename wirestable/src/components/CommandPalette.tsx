"use client";

import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { SyncIcon, BoltIcon, WaveIcon, BriefcaseIcon } from "@/components/icons/CustomIcons";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
}

export function CommandPalette({ isOpen, onClose, onExecuteCommand }: CommandPaletteProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValue("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Translate Raycast command syntax to natural chat input
  const handleExecute = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let translated = trimmed;
    if (trimmed.startsWith("/swap")) {
      const parts = trimmed.split(/\s+/);
      const amount = parts[1] || "10";
      const fromToken = parts[2] || "USDC";
      const toToken = parts[3] || "EURC";
      translated = `swap ${amount} ${fromToken} for ${toToken}`;
    } else if (trimmed.startsWith("/send")) {
      const parts = trimmed.split(/\s+/);
      const amount = parts[1] || "10";
      const toIndex = parts.indexOf("to");
      const recipient = toIndex !== -1 ? parts.slice(toIndex + 1).join(" ") : parts.slice(2).join(" ");
      translated = `send ${amount} USDC to ${recipient || "0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b"}`;
    } else if (trimmed.startsWith("/bridge")) {
      const parts = trimmed.split(/\s+/);
      const amount = parts[1] || "10";
      const fromIndex = parts.indexOf("from");
      const chain = fromIndex !== -1 ? parts.slice(fromIndex + 1).join(" ") : "Base";
      translated = `bridge ${amount} USDC from ${chain}`;
    } else if (trimmed === "/balance") {
      translated = "show my balance";
    }

    onExecuteCommand(translated);
    onClose();
  };

  // Pre-configured suggestions
  const items = [
    {
      category: "Swap Assets",
      icon: <SyncIcon size={16} />,
      name: "/swap 10 USDC EURC",
      description: "Convert 10 USDC to EURC using StableFX rates",
      value: "/swap 10 USDC EURC"
    },
    {
      category: "Swap Assets",
      icon: <SyncIcon size={16} />,
      name: "/swap 50 EURC USDC",
      description: "Convert 50 EURC to USDC using StableFX rates",
      value: "/swap 50 EURC USDC"
    },
    {
      category: "Send Funds",
      icon: <BoltIcon size={16} />,
      name: "/send 150 to Alice",
      description: "Transfer 150 USDC to Alice (0xa2b2...)",
      value: "/send 150 to 0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b"
    },
    {
      category: "Send Funds",
      icon: <BoltIcon size={16} />,
      name: "/send 25 to Bob",
      description: "Transfer 25 USDC to Bob (0x7397...)",
      value: "/send 25 to 0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8"
    },
    {
      category: "Bridge Portfolios",
      icon: <WaveIcon size={16} />,
      name: "/bridge 100 from Base",
      description: "Bridge 100 USDC from Base Sepolia to Arc",
      value: "/bridge 100 from Base"
    },
    {
      category: "Bridge Portfolios",
      icon: <WaveIcon size={16} />,
      name: "/bridge 50 from Arbitrum",
      description: "Bridge 50 USDC from Arbitrum Sepolia to Arc",
      value: "/bridge 50 from Arbitrum"
    },
    {
      category: "Account & Balances",
      icon: <BriefcaseIcon size={16} />,
      name: "/balance",
      description: "Check unified multi-chain balances and portfolio",
      value: "/balance"
    }
  ];

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-container" onClick={(e) => e.stopPropagation()}>
        <Command label="Spotlight Search">
          <div className="command-palette-search">
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", fontWeight: "bold", textTransform: "uppercase", marginRight: "4px" }}>Search</span>
            <Command.Input
              className="command-palette-input"
              placeholder="Type a Raycast command (e.g. /swap 10 USDC EURC)..."
              value={value}
              onValueChange={setValue}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleExecute(value);
                }
              }}
              autoFocus
            />
            <span className="command-palette-kbd">ESC</span>
          </div>

          <Command.List className="command-palette-list">
            <Command.Empty>
              <div style={{ padding: "16px", textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-tertiary)" }}>
                Press <span className="command-palette-kbd" style={{ fontFamily: "var(--font-mono)" }}>Enter</span> to run Custom command: <span className="text-mono" style={{ color: "var(--color-accent)", display: "block", marginTop: "8px" }}>{value}</span>
              </div>
            </Command.Empty>

            {/* Swap Category */}
            <Command.Group heading="Swap Rules" className="command-palette-group-title">
              {items
                .filter((i) => i.category === "Swap Assets")
                .map((item) => (
                  <Command.Item
                    key={item.name}
                    value={item.value}
                    onSelect={() => handleExecute(item.value)}
                    className="command-palette-item"
                  >
                    <div className="command-palette-item-content">
                      <span className="command-palette-item-icon">{item.icon}</span>
                      <div>
                        <span className="command-palette-item-name">{item.name}</span>
                        <div className="command-palette-item-desc">{item.description}</div>
                      </div>
                    </div>
                    <div className="command-palette-item-shortcut">
                      <span className="command-palette-kbd">⏎</span>
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>

            {/* Send Category */}
            <Command.Group heading="Remittance Corridor" className="command-palette-group-title">
              {items
                .filter((i) => i.category === "Send Funds")
                .map((item) => (
                  <Command.Item
                    key={item.name}
                    value={item.value}
                    onSelect={() => handleExecute(item.value)}
                    className="command-palette-item"
                  >
                    <div className="command-palette-item-content">
                      <span className="command-palette-item-icon">{item.icon}</span>
                      <div>
                        <span className="command-palette-item-name">{item.name}</span>
                        <div className="command-palette-item-desc">{item.description}</div>
                      </div>
                    </div>
                    <div className="command-palette-item-shortcut">
                      <span className="command-palette-kbd">⏎</span>
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>

            {/* Bridge Category */}
            <Command.Group heading="Cross-Chain CCTP Bridges" className="command-palette-group-title">
              {items
                .filter((i) => i.category === "Bridge Portfolios")
                .map((item) => (
                  <Command.Item
                    key={item.name}
                    value={item.value}
                    onSelect={() => handleExecute(item.value)}
                    className="command-palette-item"
                  >
                    <div className="command-palette-item-content">
                      <span className="command-palette-item-icon">{item.icon}</span>
                      <div>
                        <span className="command-palette-item-name">{item.name}</span>
                        <div className="command-palette-item-desc">{item.description}</div>
                      </div>
                    </div>
                    <div className="command-palette-item-shortcut">
                      <span className="command-palette-kbd">⏎</span>
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>

            {/* General Category */}
            <Command.Group heading="Global Balances" className="command-palette-group-title">
              {items
                .filter((i) => i.category === "Account & Balances")
                .map((item) => (
                  <Command.Item
                    key={item.name}
                    value={item.value}
                    onSelect={() => handleExecute(item.value)}
                    className="command-palette-item"
                  >
                    <div className="command-palette-item-content">
                      <span className="command-palette-item-icon">{item.icon}</span>
                      <div>
                        <span className="command-palette-item-name">{item.name}</span>
                        <div className="command-palette-item-desc">{item.description}</div>
                      </div>
                    </div>
                    <div className="command-palette-item-shortcut">
                      <span className="command-palette-kbd">⏎</span>
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>
          </Command.List>

          <div className="command-palette-footer">
            <span>Use ↑↓ arrows to navigate, ⏎ to select, Esc to exit.</span>
            <div className="command-palette-footer-actions">
              <span>Raycast Style Console</span>
              <span className="command-palette-kbd" style={{ background: "rgba(107, 76, 255, 0.1)", border: "1px solid rgba(107, 76, 255, 0.2)", color: "var(--color-accent)" }}>
                ⌘ K
              </span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
