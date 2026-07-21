// Shared color palettes for both the main app and the Quick Capture widget.
// Keeping these in one place means the widget always matches the app's theme.
export const PALETTES = {
  dark: {
    bg: "#0B0A08", sb: "#0E0D0A", surf: "#151310", surf2: "#1C1A15",
    border: "rgba(255,255,255,0.07)", text: "#EDE6D6",
    text2: "#7A7264", text3: "#474038",
    entryText: "#C8C0AE",
    chkBorder: "rgba(255,255,255,0.18)",
    gold: "#C8A564", goldDim: "rgba(200,165,100,0.1)", goldBorder: "rgba(200,165,100,0.22)",
    // theme-aware tokens for spots that were previously hardcoded dark
    overlay: "rgba(255,255,255,0.04)", overlayHi: "rgba(255,255,255,0.10)",
    track: "rgba(255,255,255,0.06)", dashed: "rgba(255,255,255,0.09)",
    divider: "rgba(255,255,255,0.05)", modalSurf: "#161410",
    onGold: "#0B0A08", scrim: "rgba(6,5,4,0.65)",
    danger: "#D67878", dangerBg: "rgba(214,120,120,0.12)",
    dangerBorder: "rgba(214,120,120,0.32)", onDanger: "#1A0E0D",
  },
  light: {
    bg: "#FDFAF3", sb: "#F5EFE2", surf: "#FFFFFF", surf2: "#FAF6EC",
    border: "rgba(0,0,0,0.09)", text: "#2A2520",
    text2: "#6B6356", text3: "#A39A87",
    entryText: "#3A322B",
    chkBorder: "rgba(60,46,28,0.45)",
    gold: "#9C7E40", goldDim: "rgba(156,126,64,0.10)", goldBorder: "rgba(156,126,64,0.28)",
    overlay: "rgba(0,0,0,0.04)", overlayHi: "rgba(0,0,0,0.10)",
    track: "rgba(0,0,0,0.09)", dashed: "rgba(0,0,0,0.14)",
    divider: "rgba(0,0,0,0.06)", modalSurf: "#FFFFFF",
    onGold: "#FFFFFF", scrim: "rgba(40,32,24,0.32)",
    danger: "#B4483F", dangerBg: "rgba(180,72,63,0.08)",
    dangerBorder: "rgba(180,72,63,0.28)", onDanger: "#FFFFFF",
  },
};
