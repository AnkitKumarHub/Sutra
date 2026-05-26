"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDashboard,
  IconClipboardText,
  IconChartBar,
  IconSettings,
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavUser } from "~/components/nav-user"
import { useUser } from "~/hooks/api/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "~/components/ui/sidebar"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    exact: true,
  },
  {
    title: "Forms",
    url: "/dashboard/forms",
    icon: IconClipboardText,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: IconChartBar,
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useUser()

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Header: Brand + Trigger ──────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-1 py-1">
              {/* Brand */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 min-w-0"
              >
                <IconInnerShadowTop className="size-5 shrink-0 text-primary" />
                <span className="text-base font-semibold group-data-[collapsible=icon]:hidden truncate">
                  Sutra
                </span>
              </Link>
              {/* Same PanelLeftIcon trigger — hidden in icon-collapsed mode */}
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden -mr-1 shrink-0" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* ── Footer: Real user ────────────────────────────────── */}
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.fullName ?? "",
            email: user?.email ?? "",
            avatar: user?.profileImageUrl ?? "",
          }}
          isLoading={isLoading}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
