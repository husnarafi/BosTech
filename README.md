# RoomMate AI

A Wayfair-style furniture discovery agent app powered by Claude AI.

## Stack
- React 19 + Vite 8
- Tailwind CSS v4
- Claude API (`claude-sonnet-4-20250514`)

## Quick Start

```bash
npm install
npm run dev
```

Set your Anthropic API key in a `.env` file:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Or enter it directly in the app UI when prompted.

## Features

- **Style Quiz** — 4-question conversational quiz (room type, vibe, budget slider, constraints)
- **AI Recommendations** — Claude ranks 3 products with personalized match scores, pros, caveats, and review summaries
- **Comparison Tool** — Ask why the top pick beats the alternatives
- **Ask RoomMate** — Follow-up chat powered by Claude with full room profile context
