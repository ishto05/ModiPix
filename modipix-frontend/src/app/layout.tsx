import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import QueryProvider from "./_components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import AppShell from "./_components/app-shell";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModiPix",
  description: "ModiPix — an AI-powered image moderation tool",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn("⚠️ Clerk publishable key is missing! Check .env.local");
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: "dark",
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <SidebarProvider>
                <AppShell>{children}</AppShell>
              </SidebarProvider>
              <Toaster position="top-right" />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
