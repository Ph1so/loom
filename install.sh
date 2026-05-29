#!/usr/bin/env bash
# Build the loom-desktop Electron app and install it to /Applications,
# replacing any previously installed copy.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/loom-desktop"
RELEASE_DIR="$APP_DIR/release"
APP_NAME="Loom"
INSTALL_DIR="/Applications"
TARGET="$INSTALL_DIR/$APP_NAME.app"

cd "$APP_DIR"

echo "[1/4] Cleaning previous build output in $RELEASE_DIR ..."
rm -rf "$RELEASE_DIR"

echo "[2/4] Building $APP_NAME (vite + electron-builder) ..."
npm run build

BUILT_APP=$(find "$RELEASE_DIR" -maxdepth 3 -name "$APP_NAME.app" -type d | head -n 1)
if [[ -z "${BUILT_APP:-}" ]]; then
  echo "ERROR: build did not produce $APP_NAME.app under $RELEASE_DIR" >&2
  exit 1
fi
echo "       Built: $BUILT_APP"

if pgrep -x "$APP_NAME" > /dev/null; then
  echo "[3/4] Quitting running $APP_NAME ..."
  osascript -e "quit app \"$APP_NAME\"" 2>/dev/null || true
  for _ in 1 2 3 4 5; do
    pgrep -x "$APP_NAME" > /dev/null || break
    sleep 1
  done
  if pgrep -x "$APP_NAME" > /dev/null; then
    echo "ERROR: $APP_NAME is still running; close it manually and re-run." >&2
    exit 1
  fi
else
  echo "[3/4] $APP_NAME is not running."
fi

if [[ -d "$TARGET" ]]; then
  echo "       Removing old $TARGET"
  rm -rf "$TARGET"
fi

echo "[4/4] Installing to $TARGET ..."
cp -R "$BUILT_APP" "$TARGET"

# Strip macOS quarantine so first launch doesn't show the "downloaded" warning.
xattr -dr com.apple.quarantine "$TARGET" 2>/dev/null || true

echo "Done. Launch $APP_NAME from /Applications, Spotlight, or:"
echo "    open \"$TARGET\""
