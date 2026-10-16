import { ImageResponse } from "next/og";

export const alt = "POP ATLAS — An unofficial POP MART art toy archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 站点默认分享图（各 IP / 系列 / 产品页使用各自的封面图） */
export default function OpengraphImage() {
  const dots = ["#2F6B4F", "#23838F", "#B8A6FF", "#4672D6", "#8B5E43", "#DE4F78", "#E99A12"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f6f4f0",
          color: "#141416",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: "#141416", display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: 12, width: 22, height: 22, borderRadius: 11, background: "#f6f4f0" }} />
            <div style={{ position: "absolute", left: 34, top: 33, width: 11, height: 11, borderRadius: 6, background: "#ff5b3a" }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>POP ATLAS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 900, letterSpacing: -6, lineHeight: 0.9 }}>Art Toy</div>
          <div style={{ fontSize: 112, fontWeight: 900, letterSpacing: -6, lineHeight: 0.9 }}>Archive.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#55555c" }}>
            Characters, stories & collections of POP MART — unofficial, for learning.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {dots.map((c) => (
            <div key={c} style={{ width: 36, height: 36, borderRadius: 18, background: c }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
