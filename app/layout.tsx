import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import DevAuthLoader from "@/components/DevAuthLoader";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });
const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-quicksand"
});

export const metadata: Metadata = {
  title: "XV Studio - Marketing Content Creation",
  description: "AI-driven marketing content creation studio for SMBs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${quicksand.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <DevAuthLoader />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}





