"use client";

import { SignedIn, SignedOut, RedirectToSignIn, UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { RippleButton } from "@/components/ui/ripple-button";
import { ShineBorder } from "@/components/magicui/shine-border";

export default function ProfilePage() {
  const { resolvedTheme } = useTheme();
  const activeTheme = resolvedTheme || "light";
  const router = useRouter();

  const handleClose = () => router.push("/dashboard");

  return (
    <>
      <SignedIn>
        <main className="relative flex justify-center items-center min-h-screen bg-background text-foreground transition-colors px-4">
          {/* Close Button */}
          

          <UserProfile
            routing="hash"
            key={activeTheme}
            appearance={{
              baseTheme: activeTheme === "dark" ? "dark" : "light",
              variables: {
                colorBackground: "hsl(var(--background))",
                colorPrimary: "hsl(var(--primary))",
                colorText: "hsl(var(--foreground))",
                colorInputBackground: "hsl(var(--card))",
                colorInputText: "hsl(var(--foreground))",
                borderRadius: "0.75rem",
              },
              elements: {
                rootBox:
                  "w-full max-w-4xl mx-auto bg-transparent shadow-none transition-colors",
                card:
                  "bg-card border border-border shadow-sm text-foreground rounded-2xl overflow-hidden transition-colors",
                headerTitle: "text-foreground text-lg font-semibold",
                headerSubtitle: "text-muted-foreground",
                profileSectionTitle: "text-foreground text-sm font-medium",
                formFieldLabel: "text-muted-foreground",
                navbar: "bg-transparent border-r border-border",
                navbarButton:
                  "text-foreground hover:text-primary transition-colors",
                navbarItem:
                  "text-foreground/80 hover:text-foreground transition-colors",
                scrollBox: "bg-transparent",
              },
            }}
            
          />
        </main>
        <Button
            onClick={handleClose}
            className="absolute top-6 right-6 text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
          >
            <ShineBorder/>
              <X className="w-4 h-4" />
          </Button>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
