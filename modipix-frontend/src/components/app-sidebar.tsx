"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconHistory,
  IconPhoto,
  IconSettings,
  IconShield,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

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
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  const userData = React.useMemo(() => {
    if (!user) return undefined

    const email =
      user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? ""

    return {
      name: user.fullName ?? user.username ?? email ?? "User",
      email: email ?? "—",
      avatar: user.imageUrl ?? "",
    }
  }, [user])

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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
