import type { Metadata } from "next";
import { Outfit, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
import { ThemeProvider } from "@/components/ThemeProvider";
export const metadata: Metadata = {
  title:
    "CogniVueX AI – Clinical Decision Support & Digital Twin Healthcare Platform",
  description:
    "Advanced AI healthcare platform incorporating real-time physiological twins, What-If simulation, ensemble prediction models, and medical decision support.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("h-full", inter.variable)}
      suppressHydrationWarning
    >
      <body className="font-sans h-full bg-background text-foreground antialiased selection:bg-blue-500/30 selection:text-blue-900 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
