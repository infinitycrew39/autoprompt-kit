import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)",
          borderRadius: 36,
        }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
            fill="white"
          />
          <path
            d="M18 14L18.9 17.1L22 18L18.9 18.9L18 22L17.1 18.9L14 18L17.1 17.1L18 14Z"
            fill="white"
            opacity="0.9"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
