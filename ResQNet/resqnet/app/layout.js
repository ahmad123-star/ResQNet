import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// Inter, self-hosted via next/font. Exposed as the --font-inter CSS variable,
// which globals.css wires into --font-sans (the default body font).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "ResQNet",
  description: "Emergency response coordination platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-background text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
