# WireStable — AI-Powered Cross-Border USDC Remittance

> **Track 1: Best Cross-Border Payments & Remittances Experience**
> Stablecoins Commerce Stack Challenge - Circle + Arc

## Overview

WireStable is an AI-powered remittance platform that lets users send USDC on Arc Testnet through **natural language** — type or speak your transfer instructions and the AI handles the rest.

### Features

| Feature | Description |
|---------|-------------|
| **Chat-to-Pay** | Type "Send 1000 USDC to 0x..." and AI parses your intent |
| **Voice Transfer** | Speak your transfer command via Web Speech API |
| **MCP Error Explainer** | Ask about any error code, powered by Circle MCP docs |
| **Live Tx Tracker** | Real-time conversational transaction status updates |

### Key Technical Highlights

- **Human-in-the-loop**: AI shows a confirmation card with gas estimate — user must click "Confirm" before wallet signs
- **Address validation**: viem isAddress() catches hallucinated/malformed addresses before submission
- **Sub-second finality**: Arc Testnet confirms transactions in under 1 second, reflected in real-time chat
- **USDC-native gas**: All fees are in USDC — no ETH needed

---

## Architecture

```
User Input (Text/Voice)
    |
OpenAI GPT-4o-mini (Intent Parsing)
    |
Intent JSON { amount, to, chain: "Arc_Testnet", token: "USDC" }
    |
Confirmation Card (estimateSend gas fee)
    | [User clicks "Confirm"]
RainbowKit Wallet -> viem sendTransaction (ERC-20 USDC transfer)
    |
Arc Testnet -> waitForTransactionReceipt
    |
Conversational Tx Status Update in Chat
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Wallet | RainbowKit + wagmi + viem |
| Chain | Arc Testnet (Chain ID: 5042002) |
| AI | OpenAI GPT-4o-mini |
| Voice | Web Speech API (browser native) |
| Error Docs | Circle MCP Server context |
| Styling | Vanilla CSS (Warm Beige design system) |

## Circle Products Used

- **USDC** — Primary stablecoin rail on Arc Testnet
- **Arc Testnet** — L1 blockchain with USDC-native gas
- **Circle App Kit** — SDK reference for send/bridge operations
- **Circle MCP Server** — AI-powered documentation for error explanations

## Setup

### Prerequisites
- Node.js v22+
- MetaMask or compatible wallet with Arc Testnet configured
- OpenAI API key
- WalletConnect Project ID

### 1. Install dependencies

```bash
cd wirestable
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

### 3. Fund your wallet

Get testnet USDC from https://faucet.circle.com

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Demo Flow

1. Connect wallet via RainbowKit (Arc Testnet)
2. Type: "Send 10 USDC to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
3. AI parses intent -> shows confirmation card with gas estimate
4. Click "Confirm and Sign" -> wallet popup
5. Real-time status: "Processing..." -> "Confirmed! View on Arcscan"
6. Ask: "What is error 155104?" -> MCP-powered explanation

## Project Structure

```
wirestable/
  src/
    app/
      api/
        parse/route.ts          # LLM intent parsing
        explain-error/route.ts  # MCP error explainer
      layout.tsx                # Root layout + Providers
      page.tsx                  # Main page
      globals.css               # Design system
    components/
      ChatView.tsx              # Main chat orchestrator
      ChatBubble.tsx            # Message rendering
      ConfirmationCard.tsx      # Human-in-the-loop UI
      TxTracker.tsx             # Live tx status
      ErrorExplainer.tsx        # MCP error card
      EmptyState.tsx            # Landing view
      Providers.tsx             # RainbowKit + wagmi
    hooks/
      useChat.ts                # Core chat + transfer logic
      useVoice.ts               # Web Speech API
    config/
      wagmi.ts                  # Wagmi + Arc Testnet config
    types/
      index.ts                  # TypeScript types
  next.config.ts
  tsconfig.json
  package.json
```

## Security

- Private keys are never hardcoded or logged
- All secrets stored in .env files (gitignored)
- Human-in-the-loop prevents unauthorized transfers
- Address validation via viem catches LLM hallucinations
- Testnet only — no mainnet exposure

## Circle Product Feedback

### Why These Products
- **USDC on Arc**: Perfect for remittance — stable value, predictable gas fees in USDC
- **Arc Testnet**: Sub-second finality makes real-time chat-based payments feel instant
- **Circle MCP**: Enables AI-native developer support within the chat interface

### What Worked Well
- Arc's USDC-native gas model eliminates the "which token do I need for gas?" confusion
- viem/wagmi natively support Arc Testnet — zero custom chain config needed
- Circle App Kit SDK provides clean send/estimate APIs

### What Could Be Improved
- Documentation on App Kit browser wallet integration patterns could be expanded
- MCP Server could expose structured error code lookups as a dedicated endpoint
- More examples of frontend integration patterns with RainbowKit + App Kit together

---

Built for the Stablecoins Commerce Stack Challenge - Powered by Circle and Arc
