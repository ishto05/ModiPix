"use client";

import * as React from "react";
import {
  IconDashboard,
  IconHistory,
  IconPhoto,
  IconSettings,
  IconShield,
} from "@tabler/icons-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  
  const userData = React.useMemo(() => {
    if (!user) return undefined;
    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      "";
    return {
      name: user.fullName ?? user.username ?? email ?? "User",
      email: email ?? "—",
      avatar: user.imageUrl ?? "",
    };
  }, [user]);

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: "Moderation History",
        url: "/moderation-history",
        icon: IconHistory,
      },
      {
        title: "Image Gallery",
        url: "/image-gallery",
        icon: IconPhoto,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: IconSettings,
        items: [
          {
            title: "Theme",
            component: <ModeToggle />,
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconShield className="!size-5" />
                <span className="text-base font-semibold">ModiPix</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}