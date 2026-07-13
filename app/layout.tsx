import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sneha Carries",
  description: "Accessories, daily carry goods, gifts, and lifestyle products."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
