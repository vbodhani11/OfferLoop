import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "linear-gradient(135deg,#12131a,#1d1f33)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          border: "10px solid #6366f1",
          borderRightColor: "#f97316",
          borderBottomColor: "#f97316",
        }}
      />
      <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>OfferLoop</div>
      <div style={{ fontSize: 28, color: "#a3a5b8" }}>
        A fictional career simulator for real job-search stress
      </div>
      <div style={{ fontSize: 20, color: "#818cf8", marginTop: 12 }}>
        ENTERTAINMENT SIMULATION · NOT A REAL JOB BOARD
      </div>
    </div>,
    { ...size },
  );
}
