import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const ALLOWED_SIZES = new Set([96, 192, 384, 512]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size: sizeParam } = await params;
  const parsed = parseInt(sizeParam, 10);
  const size = ALLOWED_SIZES.has(parsed) ? parsed : 512;
  const ringWidth = Math.round(size * 0.11);
  const ringSize = size - ringWidth * 2 - Math.round(size * 0.18);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#6366f1,#22d3ee)",
      }}
    >
      <div
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: `${ringWidth}px solid white`,
          borderRightColor: "#fb923c",
          borderBottomColor: "#fb923c",
        }}
      />
    </div>,
    { width: size, height: size },
  );
}
