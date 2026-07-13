import type { Metadata, Viewport } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import SmoothScroll from "@/components/SmoothScroll";
import Grain from "@/components/Grain";
import Navbar from "@/components/Navbar";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Mowlid Haibe — Software Engineer & AI Innovator",
  description:
    "Full-stack software engineer building scalable web applications for startups, nonprofits, and community-driven organizations.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070707" },
    { media: "(prefers-color-scheme: light)", color: "#f4eee1" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          // apply saved theme before first paint to avoid a flash
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.add("light")}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-ink text-cream antialiased">
        <ConvexClientProvider>
          <SmoothScroll>
            <Navbar />
            {children}
          </SmoothScroll>
          <Grain />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
