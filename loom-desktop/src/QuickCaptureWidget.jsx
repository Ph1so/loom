import { useState, useRef, useEffect } from "react";
import { PALETTES } from "./palette.js";

// Standalone Quick Capture surface rendered in the frameless widget window.
// It owns no journal state -- it just hands captured text to the main process
// (loomAPI.quickCapture) which appends it to the Inbox and broadcasts a refresh.
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: transparent; overflow: hidden; }
  textarea { font-family: "DM Sans", sans-serif; outline: none; }
  textarea::-webkit-scrollbar { width: 3px; }
  textarea::-webkit-scrollbar-thumb { background: rgba(127,127,127,0.3); border-radius: 2px; }
  @keyframes wpop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
`;

export default function QuickCaptureWidget() {
  const [theme, setTheme] = useState("dark");
  const [text, setText]   = useState("");
  const [flash, setFlash] = useState(null); // { count } when a capture just landed
  const taRef     = useRef(null);
  const flashTimer = useRef(null);

  const C = PALETTES[theme] || PALETTES.dark;

  // Pull the active theme from the widget config (mirrors the app's theme).
  useEffect(() => {
    if (!window.loomAPI?.getWidgetConfig) return;
    window.loomAPI.getWidgetConfig().then(cfg => {
      if (cfg?.theme === "light" || cfg?.theme === "dark") setTheme(cfg.theme);
    }).catch(() => {});
    // Refresh theme whenever the window regains focus (cheap, keeps it in sync).
    const onFocus = () => {
      window.loomAPI.getWidgetConfig?.().then(cfg => {
        if (cfg?.theme === "light" || cfg?.theme === "dark") setTheme(cfg.theme);
      }).catch(() => {});
      taRef.current?.focus();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const doCapture = async () => {
    const t = text.trim();
    if (!t || !window.loomAPI?.quickCapture) return;
    setText("");
    const res = await window.loomAPI.quickCapture(t);
    if (res?.ok) {
      setFlash({ count: res.inboxCount });
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), 1600);
    }
    taRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doCapture(); }
    else if (e.key === "Escape") { e.preventDefault(); window.loomAPI?.hideWidget?.(); }
  };

  return (
    <>
      <style>{FONTS}</style>
      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        background: C.surf, border: `1px solid ${C.border}`, borderRadius: 14,
        boxShadow: "0 12px 34px rgba(0,0,0,0.4)", overflow: "hidden",
        animation: "wpop 0.16s ease both",
      }}>
        {/* Draggable header strip */}
        <div style={{
          WebkitAppRegion: "drag", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "9px 14px 7px",
        }}>
          <span style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
            Quick Capture
          </span>
          {flash && (
            <span style={{ fontSize: 10.5, color: C.gold, fontWeight: 500, WebkitAppRegion: "no-drag" }}>
              Captured ✓{typeof flash.count === "number" ? ` · ${flash.count} in inbox` : ""}
            </span>
          )}
        </div>

        <div style={{ flex: 1, padding: "0 14px", WebkitAppRegion: "no-drag", display: "flex" }}>
          <textarea
            ref={taRef} autoFocus value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Capture a thought -- goes to Inbox..."
            style={{
              width: "100%", flex: 1, background: "transparent", border: "none",
              color: C.text, fontSize: 14, lineHeight: 1.6, resize: "none", fontWeight: 300,
            }}
          />
        </div>

        <div style={{
          WebkitAppRegion: "no-drag", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "8px 14px 11px",
          borderTop: `1px solid ${C.divider}`, margin: "4px 0 0",
        }}>
          <span style={{ fontSize: 10.5, color: C.text3 }}>Enter to capture · Esc to hide</span>
          <button
            onClick={doCapture}
            className="gold-btn"
            style={{
              background: text.trim() ? C.gold : C.goldDim, border: "none", borderRadius: 7,
              color: text.trim() ? C.onGold : C.text3, fontSize: 11.5, padding: "6px 14px",
              cursor: text.trim() ? "pointer" : "default", fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
            }}
          >
            Capture
          </button>
        </div>
      </div>
    </>
  );
}
