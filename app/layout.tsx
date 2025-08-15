export const metadata = {
  title: "Face Max Academy — Implant Course",
  description: "Implant Dentistry, simplified for surgeons.",
  manifest: "/site.webmanifest?v=5",
  themeColor: "#0f172a",
  icons: {
    icon: [
      { url: "/icons/face-max-icon.png?v=5", sizes: "32x32", type: "image/png" },
      { url: "/icons/face-max-icon.png?v=5", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/icons/face-max-icon.png?v=5", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "icon", url: "/icons/face-max-icon.png?v=5", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/icons/face-max-icon.png?v=5",     sizes: "512x512", type: "image/png" }
    ],
    // include shortcut only if favicon.ico exists at /public
    // shortcut: ["/favicon.ico?v=5"]
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
