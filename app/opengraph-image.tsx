import { ImageResponse } from "next/og";

export const alt = "PARABOX — Tienda Oficial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.06), transparent 45%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              border: "3px solid #ffffff",
              display: "flex",
            }}
          />
          <div style={{ display: "flex", color: "#ffffff", fontSize: 108, fontWeight: 700, letterSpacing: -2 }}>
            PARABOX
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Desk &amp; Focus Collection
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 24,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Accesorios de Escritorio Premium
        </div>
      </div>
    ),
    { ...size }
  );
}
