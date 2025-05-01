import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { type ReactNode } from "react";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Kriptoin",
};

export default async function RootLayout(props: { children: ReactNode }) {
  
  return (
    <html lang="en">
      <body className={`${font.className} bg-white antialiased`}>
        <Toaster position="top-right" />
        <Providers>{props.children}</Providers>
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
