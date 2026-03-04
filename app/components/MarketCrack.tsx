"use client";

import { useState, useRef, useEffect } from "react";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const parseScore = (t: string) => {
  const m =
    t.match(/FINAL VERDICT:\s*(\d+(?:\.\d+)?)\/10/i) ||
    t.match(/WEIGHTED TOTAL.*?(\d+(?:\.\d+)?)\/10/i);
  return m ? parseFloat(m[1]) : null;
};
const parseVerdict = (t: string) => {
  const m = t.match(/RECOMMENDATION:\s*(GO|PIVOT|STOP)/i);
  return m ? m[1] : null;
};
const parseSignal = (t: string) => {
  const m = t.match(
    /INVESTOR SIGNAL:\s*(FUNDABLE|BOOTSTRAPPABLE|NOT YET|PASS)/i
  );
  return m ? m[1] : null;
};
const scoreColor = (s: number) =>
  s >= 7 ? "#16a34a" : s >= 5 ? "#d97706" : "#dc2626";

const VSTYLE: Record<string, { bg: string; fg: string; bd: string }> = {
  GO: { bg: "#f0fdf4", fg: "#15803d", bd: "#86efac" },
  PIVOT: { bg: "#fffbeb", fg: "#b45309", bd: "#fcd34d" },
  STOP: { bg: "#fef2f2", fg: "#b91c1c", bd: "#fca5a5" },
};
const ISTYLE: Record<string, { fg: string; bd: string }> = {
  FUNDABLE: { fg: "#15803d", bd: "#86efac" },
  BOOTSTRAPPABLE: { fg: "#1d4ed8", bd: "#93c5fd" },
  "NOT YET": { fg: "#b45309", bd: "#fcd34d" },
  PASS: { fg: "#b91c1c", bd: "#fca5a5" },
};

// ─── MARKDOWN ─────────────────────────────────────────────────────────────────

function ri(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return (
          <strong key={i} style={{ color: "#111827", fontWeight: 600 }}>
            {p.slice(2, -2)}
          </strong>
        );
      if (p.startsWith("`") && p.endsWith("`"))
        return (
          <code
            key={i}
            style={{
              background: "#f3f4f6",
              color: "#374151",
              padding: "1px 5px",
              borderRadius: 3,
              fontSize: 12,
              fontFamily: "monospace",
            }}
          >
            {p.slice(1, -1)}
          </code>
        );
      return p;
    });
}

function MD({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {lines.map((line, i) => {
        if (line.startsWith("## "))
          return (
            <div
              key={i}
              style={{
                marginTop: 32,
                marginBottom: 8,
                paddingBottom: 8,
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {line.replace(/^##\s*/, "")}
              </span>
            </div>
          );

        if (line.match(/^###\s/) || line.match(/^## \d+\./))
          return (
            <div
              key={i}
              style={{
                marginTop: 22,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  background: "#1d4ed8",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}
              >
                {line.replace(/^#{2,3}\s*/, "")}
              </span>
            </div>
          );

        if (line.match(/FINAL VERDICT:/i))
          return (
            <div
              key={i}
              style={{
                fontWeight: 700,
                color: "#111827",
                fontSize: 16,
                marginTop: 24,
                padding: "12px 16px",
                background: "#f9fafb",
                borderLeft: "4px solid #1d4ed8",
                borderRadius: "0 6px 6px 0",
              }}
            >
              {line.replace(/\*\*/g, "")}
            </div>
          );

        if (line.match(/^(RECOMMENDATION|INVESTOR SIGNAL):/i))
          return (
            <div
              key={i}
              style={{
                fontWeight: 600,
                color: "#374151",
                fontSize: 13,
                marginTop: 6,
                paddingLeft: 20,
              }}
            >
              {line.replace(/\*\*/g, "")}
            </div>
          );

        if (line.match(/^\*\*Option [A-C]|\*\*Optie [A-C]/))
          return (
            <div
              key={i}
              style={{
                fontWeight: 700,
                color: "#1d4ed8",
                fontSize: 13,
                marginTop: 14,
                marginBottom: 4,
              }}
            >
              {line.replace(/\*\*/g, "")}
            </div>
          );

        if (line.startsWith("|")) {
          const cells = line
            .split("|")
            .filter((_, idx) => idx > 0 && idx < line.split("|").length - 1);
          if (line.includes("---")) return null;
          const isHeader =
            lines[i + 1]?.includes("---") || lines[i - 1]?.includes("---");
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
                borderBottom: "1px solid #f3f4f6",
                padding: "7px 0",
                background: isHeader ? "#f9fafb" : "transparent",
              }}
            >
              {cells.map((c, j) => (
                <div
                  key={j}
                  style={{
                    fontSize: 12,
                    color: isHeader ? "#6b7280" : "#374151",
                    fontWeight: isHeader ? 700 : 400,
                    padding: "0 8px",
                    textTransform: isHeader ? "uppercase" : "none",
                    letterSpacing: isHeader ? 0.5 : 0,
                  }}
                >
                  {ri(c.trim())}
                </div>
              ))}
            </div>
          );
        }

        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <div
              key={i}
              style={{
                fontWeight: 600,
                color: "#111827",
                fontSize: 13,
                marginTop: 10,
                marginBottom: 2,
              }}
            >
              {line.slice(2, -2)}
            </div>
          );

        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                paddingLeft: 4,
                marginTop: 3,
              }}
            >
              <span
                style={{
                  color: "#9ca3af",
                  flexShrink: 0,
                  marginTop: 5,
                  fontSize: 8,
                }}
              >
                ●
              </span>
              <span
                style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7 }}
              >
                {ri(line.replace(/^[-•]\s+/, ""))}
              </span>
            </div>
          );

        if (line.match(/^\d+\.\s/))
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                paddingLeft: 4,
                marginTop: 3,
              }}
            >
              <span
                style={{
                  color: "#1d4ed8",
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  minWidth: 18,
                  marginTop: 2,
                }}
              >
                {line.match(/^(\d+)/)![1]}.
              </span>
              <span
                style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7 }}
              >
                {ri(line.replace(/^\d+\.\s/, ""))}
              </span>
            </div>
          );

        if (line.startsWith("---"))
          return (
            <div
              key={i}
              style={{ borderTop: "1px solid #e5e7eb", margin: "20px 0" }}
            />
          );
        if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
        return (
          <div
            key={i}
            style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.75 }}
          >
            {ri(line)}
          </div>
        );
      })}
    </div>
  );
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────

function ScoreDisplay({
  score,
  verdict,
  signal,
}: {
  score: number | null;
  verdict: string | null;
  signal: string | null;
}) {
  const c = score ? scoreColor(score) : "#9ca3af";
  const vs = verdict ? VSTYLE[verdict] : null;
  const is = signal ? ISTYLE[signal] : null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      {score && (
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            border: `3px solid ${c}`,
            background: `${c}10`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: c,
              fontFamily: "monospace",
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span style={{ fontSize: 8, color: "#9ca3af" }}>/10</span>
        </div>
      )}
      {vs && (
        <div
          style={{
            padding: "4px 12px",
            borderRadius: 4,
            background: vs.bg,
            border: `1px solid ${vs.bd}`,
            color: vs.fg,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 2,
          }}
        >
          {verdict}
        </div>
      )}
      {is && (
        <div
          style={{
            padding: "4px 12px",
            borderRadius: 4,
            background: "transparent",
            border: `1px solid ${is.bd}`,
            color: is.fg,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: 1,
          }}
        >
          {signal}
        </div>
      )}
    </div>
  );
}

const IS: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  padding: "9px 11px",
  color: "#111827",
  fontSize: 13,
  transition: "border-color .15s",
};
const LS: React.CSSProperties = {
  fontSize: 10,
  color: "#9ca3af",
  letterSpacing: 1,
  textTransform: "uppercase",
  display: "block",
  marginBottom: 5,
  fontWeight: 600,
};

function RunButton({
  disabled,
  onClick,
  loading,
}: {
  disabled: boolean;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "11px 0",
        borderRadius: 6,
        border: "none",
        background: disabled ? "#f3f4f6" : "#1d4ed8",
        color: disabled ? "#9ca3af" : "#fff",
        fontWeight: 600,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "background .15s",
        fontFamily: "inherit",
      }}
    >
      {loading ? (
        <>
          <div
            style={{
              width: 13,
              height: 13,
              border: "2px solid #93c5fd",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
            }}
          />
          Analyzing…
        </>
      ) : (
        "Run Analysis →"
      )}
    </button>
  );
}

function IdeaForm({
  onSubmit,
  loading,
}: {
  onSubmit: (v: string) => void;
  loading: boolean;
}) {
  const [v, setV] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={LS}>Describe your idea *</label>
        <textarea
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="What is it? Who is it for? How do you make money? How far along are you?"
          style={{ ...IS, height: 130, lineHeight: "1.6" }}
          onFocus={(e) => (e.target.style.borderColor = "#1d4ed8")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
          More context = sharper analysis.
        </div>
      </div>
      <RunButton
        disabled={loading || !v.trim()}
        onClick={() => onSubmit(v)}
        loading={loading}
      />
    </div>
  );
}

function BusinessForm({
  onSubmit,
  loading,
}: {
  onSubmit: (v: string) => void;
  loading: boolean;
}) {
  const [url, setUrl] = useState("");
  const [extra, setExtra] = useState("");
  const [open, setOpen] = useState(false);
  const valid = url.trim().length > 5;
  const prompt = `Website: ${url.trim()}${extra ? `\n\nAdditional context:\n${extra}` : ""}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={LS}>Company website *</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourcompany.com"
          style={IS}
          onFocus={(e) => (e.target.style.borderColor = "#1d4ed8")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
          MarketCrack researches company, competitors, and market automatically.
        </div>
      </div>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          background: "none",
          border: "none",
          color: "#6b7280",
          fontSize: 11,
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
          fontFamily: "inherit",
        }}
      >
        {open ? "▾" : "▸"} Add context not on the website (optional)
      </button>
      {open && (
        <div>
          <label style={LS}>Additional context</label>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="Revenue, team size, biggest challenge, strategic goal — anything not public"
            style={{ ...IS, height: 85, lineHeight: "1.6" }}
            onFocus={(e) => (e.target.style.borderColor = "#1d4ed8")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
      )}
      <RunButton
        disabled={loading || !valid}
        onClick={() => onSubmit(prompt)}
        loading={loading}
      />
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface HistoryItem {
  label: string;
  result: string;
  mode: string;
  score: number | null;
  verdict: string | null;
  signal: string | null;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  "Problem Validation","Why Now","ICP","Market Size (TAM/SAM/SOM)",
  "Competitive Landscape","Differentiation","Moat Analysis","AI Substitutability",
  "Go-to-Market","Unit Economics","Business Model","Regulatory Landscape",
  "Build vs Buy vs Partner","Team Fit","Traction Signals","Exit Potential",
  "Porter's Five Forces","Risks & Assumptions","What Would Need to Be True",
  "Scenarios (Bull/Base/Bear)","Investor Narrative","Next 90 Days",
];

export default function MarketCrack() {
  const [mode, setMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultRef.current && streaming)
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
  }, [result, streaming]);
async function analyze(userPrompt: string) {
    setLoading(true);
    setStreaming(false);
    setResult("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, mode }),
      });
      const data = await res.json();
      if (data.text) {
        setResult(data.text);
        const label = userPrompt.match(/https?:\/\/[^\s]+/)?.[0] || userPrompt.slice(0, 52) + "…";
        setHistory((p) => [{ label, result: data.text, mode: mode!, score: parseScore(data.text), verdict: parseVerdict(data.text), signal: parseSignal(data.text) }, ...p.slice(0, 5)]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }
  

  const score = parseScore(result);
  const verdict = parseVerdict(result);
  const signal = parseSignal(result);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 52,
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span
            style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}
          >
            MarketCrack
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#9ca3af",
              background: "#f3f4f6",
              padding: "2px 7px",
              borderRadius: 10,
              fontWeight: 500,
            }}
          >
            beta
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>
          22 dimensions · live web research · McKinsey methodology
        </span>
      </nav>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 52px)" }}>
        {/* SIDEBAR */}
        <div
          style={{
            width: 272,
            flexShrink: 0,
            borderRight: "1px solid #e5e7eb",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "18px 16px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {!mode ? (
              <>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Select analysis type
                </div>

                {[
                  {
                    key: "idea",
                    icon: "💡",
                    title: "New Idea",
                    sub: "Validate before you build",
                  },
                  {
                    key: "business",
                    icon: "🏢",
                    title: "Existing Business",
                    sub: "Paste URL — we research the rest",
                  },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMode(m.key);
                      setResult("");
                    }}
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "12px 13px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      marginBottom: 4,
                      transition: "all .15s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#1d4ed8";
                      (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
                      (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb";
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#111827",
                        marginBottom: 2,
                      }}
                    >
                      {m.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{m.sub}</div>
                  </button>
                ))}

                <div
                  style={{
                    marginTop: 16,
                    borderTop: "1px solid #f3f4f6",
                    paddingTop: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      fontWeight: 600,
                      marginBottom: 10,
                    }}
                  >
                    22 Analysis Dimensions
                  </div>
                  {SECTIONS.map((s, idx) => (
                    <div
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 0",
                        borderBottom: "1px solid #f9fafb",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: "#d1d5db",
                          fontFamily: "monospace",
                          minWidth: 20,
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ animation: "fadeIn .2s ease" }}>
                <button
                  onClick={() => {
                    setMode(null);
                    setResult("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: 11,
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "inherit",
                  }}
                >
                  ← Back
                </button>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  {mode === "idea" ? "💡 Idea Validation" : "🏢 Business Analysis"}
                </div>
                <div
                  style={{ fontSize: 11, color: "#6b7280", marginBottom: 18 }}
                >
                  {mode === "idea"
                    ? "22 dimensions + live market research"
                    : "URL → auto-research → 22 dimensions"}
                </div>
                {mode === "idea" ? (
                  <IdeaForm onSubmit={analyze} loading={loading} />
                ) : (
                  <BusinessForm onSubmit={analyze} loading={loading} />
                )}
              </div>
            )}

            {history.length > 0 && (
              <div
                style={{
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: 14,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Recent
                </div>
                {history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setResult(h.result);
                      setMode(h.mode);
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: "#f9fafb",
                      border: "1px solid #f3f4f6",
                      cursor: "pointer",
                      marginBottom: 5,
                      transition: "border-color .15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.borderColor = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.borderColor = "#f3f4f6")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 150,
                        }}
                      >
                        {h.mode === "idea" ? "💡 " : "🏢 "}
                        {h.label}
                      </span>
                      {h.score && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: scoreColor(h.score),
                            fontFamily: "monospace",
                            flexShrink: 0,
                          }}
                        >
                          {h.score}/10
                        </span>
                      )}
                    </div>
                    {h.verdict && (
                      <div
                        style={{
                          fontSize: 10,
                          color: VSTYLE[h.verdict]?.fg,
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        {h.verdict}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MAIN */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#f9fafb",
          }}
        >
          {!result && !loading && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                padding: 48,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div style={{ textAlign: "center", maxWidth: 380 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 8,
                    letterSpacing: -0.4,
                  }}
                >
                  Pressure-test your idea or business
                </div>
                <div
                  style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}
                >
                  22 dimensions of McKinsey-style analysis — powered by live
                  web research. Market sizing, competition, moat, AI risk, unit
                  economics, exit potential and more.
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  maxWidth: 400,
                  marginTop: 4,
                }}
              >
                {[
                  "Market research",
                  "Competitor analysis",
                  "TAM/SAM/SOM",
                  "Unit economics",
                  "AI risk",
                  "Exit potential",
                ].map((t) => (
                  <div
                    key={t}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 6,
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      fontSize: 11,
                      color: "#6b7280",
                      textAlign: "center",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && !result && (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: "3px solid #e5e7eb",
                    borderTopColor: "#1d4ed8",
                    borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                    margin: "0 auto 16px",
                  }}
                />
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  Researching…
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  Running web searches · Building analysis · 22 dimensions
                </div>
              </div>
            </div>
          )}

          {result && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "11px 28px",
                  borderBottom: "1px solid #e5e7eb",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
                  {streaming ? (
                    <span
                      style={{
                        animation: "pulse 1s infinite",
                        color: "#1d4ed8",
                      }}
                    >
                      ● Analyzing…
                    </span>
                  ) : (
                    <span style={{ color: "#16a34a" }}>● Analysis complete</span>
                  )}
                </div>
                <ScoreDisplay score={score} verdict={verdict} signal={signal} />
              </div>

              <div
                ref={resultRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "32px 40px",
                  animation: "fadeIn .3s ease",
                  maxWidth: 860,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    marginBottom: 28,
                    paddingBottom: 20,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    MarketCrack · Strategic Analysis Report
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#111827",
                      letterSpacing: -0.5,
                      marginBottom: 4,
                    }}
                  >
                    {mode === "idea" ? "Idea Validation" : "Business Analysis"}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    {new Date().toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · 22 dimensions · Live web research
                  </div>
                </div>

                <MD text={result} />

                {streaming && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 14,
                      background: "#1d4ed8",
                      marginLeft: 2,
                      borderRadius: 1,
                      animation: "pulse .7s ease-in-out infinite",
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
