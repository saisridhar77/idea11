import "./globals.css";

export const metadata = {
  title: "SPREE 2026",
  description:
    "Annual Sports Festival of BITS Goa, SPREE 2026 is a three-day extravaganza of sports, camaraderie, and unforgettable moments.SPREE 2026 promises to be the ultimate arena for athletes and sports enthusiasts alike. Join us from April 3rd to 4th for an unforgettable experience where champions are made and legends are born.",
  openGraph: {
    title: "SPREE 2026",
    description: "Enter The Arena — An immersive 3D sports experience",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/logo.jpeg",
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
