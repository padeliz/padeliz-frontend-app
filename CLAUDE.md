# Padeliz Frontend — Development Rules

## Design Implementation
- Figma designs must be implemented **1:1** (pixel-perfect match). Match exact sizes, spacing, colors, typography, and layout from the design specs.
- Always reference the Figma design when implementing or modifying UI. Do not approximate — use exact values from the design.

## Component Reuse
- Always check `/components` for existing components before creating new ones.
- Reuse and extend existing components (e.g. adding props) rather than duplicating or creating new ones from scratch.
- Components in `/components/old` are legacy. If one is needed, move it to the appropriate active folder (e.g. `/components/Buttons/`) and update it to match current patterns before using it.

## Styling & Tokens
- Use design tokens from `constants/Colors.ts` and `constants/Fonts.ts` — never hardcode color hex values or font sizes directly.
- Use `StyleSheet.create()` for all styles (project convention). No inline style objects, no Tailwind classes in React Native components.
- Inter font family is the standard: Regular (400), Medium (500), Bold (700).

## Project Stack
- **Framework**: Expo 53 + React Native
- **Routing**: Expo Router (file-based, in `/app`)
- **Language**: TypeScript (strict mode)
- **Auth**: OAuth via `expo-auth-session` (Google + Apple), managed in `/context/auth.tsx`
