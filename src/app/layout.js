import "./globals.css";

export const metadata = {
  title: "SPORTSFEST 2025 — Enter The Arena",
  description:
    "Experience the ultimate 3D sports festival. Explore the stadium, register for events, and be part of history.",
  openGraph: {
    title: "SPORTSFEST 2025",
    description: "Enter The Arena — An immersive 3D sports experience",
    images: ["/og-image.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="noise-overlay">{children}</body>
    </html>
  );
}
