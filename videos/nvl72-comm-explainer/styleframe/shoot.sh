#!/usr/bin/env bash
# Render each styleframe HTML to a 1920x1080 PNG with headless Chrome.
set -uo pipefail
cd "$(dirname "$0")"
[ -f fonts/NotoSansSC.ttf ] || curl -sL -o fonts/NotoSansSC.ttf \
  "https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"
mkdir -p out
for f in ${1:-frame-*.html}; do
  name="${f%.html}"
  # Headless Chrome on this VM writes the PNG but does not exit; the timeout reaps it.
  timeout 25 google-chrome --headless=new --no-sandbox --user-data-dir="$(mktemp -d)" --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1920,1080 \
    --screenshot="out/${name}.png" "file://$PWD/$f" >/dev/null 2>&1
  echo "out/${name}.png"
done
