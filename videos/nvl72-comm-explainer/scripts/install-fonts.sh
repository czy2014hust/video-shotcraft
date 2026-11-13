#!/bin/sh
# Headless Chrome reads CJK and mono through fontconfig, not through a page-level
# FontFace wait. Copy the shipped faces into the user font directory.
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
DEST="${HOME}/.local/share/fonts"
mkdir -p "$DEST"
cp "$ROOT"/public/fonts/*.ttf "$DEST"/
if command -v fc-cache >/dev/null 2>&1; then
  fc-cache -f "$DEST"
fi
