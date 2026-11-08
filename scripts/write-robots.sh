#!/usr/bin/env bash
# Write public/robots.txt for Expo web export (build-time).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/public"

raw="$(echo "${EXPO_PUBLIC_NOINDEX:-false}" | tr '[:upper:]' '[:lower:]')"
noindex=0
if [[ "$raw" == "1" || "$raw" == "true" || "$raw" == "yes" ]]; then
  noindex=1
fi

AI_BLOCK="$(cat <<'EOF'
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: meta-externalagent
Disallow: /
EOF
)"

if [[ "$noindex" -eq 1 ]]; then
  cat > "$ROOT/public/robots.txt" <<EOF
User-agent: *
Disallow: /

${AI_BLOCK}
EOF
  echo "write-robots: noindex Disallow + AI blocks → public/robots.txt"
else
  cat > "$ROOT/public/robots.txt" <<EOF
User-agent: *
Allow: /

${AI_BLOCK}
EOF
  echo "write-robots: Allow + AI Disallow → public/robots.txt"
fi
