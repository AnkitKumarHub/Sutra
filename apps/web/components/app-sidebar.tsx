"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDashboard,
  IconClipboardText,
  IconChartBar,
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavMain } from "~/components/nav-main"
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useUser()

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Header: Brand + Trigger ──────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-1 py-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 min-w-0"
              >
                <IconInnerShadowTop className="size-5 shrink-0 text-primary" />
                <span className="text-base font-semibold group-data-[collapsible=icon]:hidden truncate">
                  Sutra
                </span>
              </Link>
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden -mr-1 shrink-0" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <SidebarContent>
        <NavMain items={navMain} />
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
