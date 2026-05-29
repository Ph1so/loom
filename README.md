# Loom — Desktop App

Your personal thread-based journal, as a native Mac app.

---

## Requirements

- **Node.js** (v18 or later) — check with `node --version`
  If you don't have it: https://nodejs.org (download the LTS version)

---

## Run in development (try it first)

```bash
cd loom-desktop
npm install
npm run dev
```

A window will open in ~5 seconds. This is the full app running live.
Your data is saved automatically to:
  ~/Library/Application Support/Loom/loom-data.json

---

## Build the real .app file

Once you're happy with it:

```bash
npm run build
```

This creates `release/mac/Loom.app` (or similar path inside `release/`).

**To install:**
1. Open the `release/` folder
2. Find `Loom.app`
3. Drag it to your Applications folder
4. Double-click to open

**First launch:** macOS may say it can't verify the developer.
Right-click Loom.app → Open → Open anyway.
This only happens once.

---

## To add to your Dock

Once Loom is running, right-click its icon in the Dock →
Options → Keep in Dock.

---

## Where your data lives

All your threads and entries are saved locally at:
  ~/Library/Application Support/Loom/loom-data.json

This file survives app updates. To back it up, just copy it somewhere.

---

## Generating a proper .icns icon (optional)

The included icon.icns is a PNG placeholder. On Mac, you can convert it properly:

```bash
# In the loom-desktop folder:
mkdir icon.iconset
sips -z 16 16   assets/icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32   assets/icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32   assets/icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64   assets/icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 assets/icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 assets/icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 assets/icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 assets/icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 assets/icon.png --out icon.iconset/icon_512x512.png
cp assets/icon.png icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o assets/icon.icns
rm -rf icon.iconset
```

Then run `npm run build` again.
