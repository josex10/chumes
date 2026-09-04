import { ImageResponse } from "next/og";
import { STOREFRONT_SEO } from "@/lib/storefront/site";

export const alt = STOREFRONT_SEO.title;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F3EC",
          color: "#1A1A1A",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#C6A15B",
          }}
        >
          Chumes
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Todo en alquiler para tu evento.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#5C584F",
              maxWidth: 820,
            }}
          >
            Mesas, sillas, mantelería y equipo en la Gran Área Metropolitana.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
