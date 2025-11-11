"use client";

import type { ReactNode } from "react";
import { SignedIn } from "@clerk/nextjs";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <SignedIn>
        <AppSidebar variant="inset" />
      </SignedIn>
      <SidebarInset>
        <SignedIn>
          <SiteHeader />
        </SignedIn>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </SidebarInset>
    </div>
  );
}

