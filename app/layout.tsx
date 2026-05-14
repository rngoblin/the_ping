import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PING",
  description: "A quiet, foggy, live electronic music venue on the internet."
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
