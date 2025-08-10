export const metadata = {
  title: "Face Max Academy — Implant Course",
  description: "Implant Dentistry, simplified for surgeons.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
