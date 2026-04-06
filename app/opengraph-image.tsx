import { ImageResponse } from "next/og";

export const alt = "Resumify — job-tailored resumes, keyword match, PDF and DOCX export";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #115e59 42%, #0f172a 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 78,
            fontWeight: 700,
            color: "white",
            letterSpacing: -3,
            lineHeight: 1.05,
          }}
        >
          Resumify
        </div>
        <div
          style={{
            fontSize: 34,
            color: "rgba(255,255,255,0.9)",
            marginTop: 20,
            maxWidth: 920,
            lineHeight: 1.35,
            fontWeight: 500,
          }}
        >
          Job-tailored resumes · keyword match · PDF and DOCX
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.55)",
            marginTop: 36,
            letterSpacing: 0.5,
          }}
        >
          resumify.cc
        </div>
      </div>
    ),
    { ...size }
  );
}
