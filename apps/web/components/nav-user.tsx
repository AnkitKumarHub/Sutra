"use client"

import {
  IconLogout,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import { Skeleton } from "~/components/ui/skeleton"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function NavUser({
  user,
  isLoading,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div className="flex flex-col gap-1 flex-1 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const handleLogout = () => {
    document.cookie = "authentication-token=; Max-Age=0; path=/"
    window.location.href = "/login"
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-2">
          {/* Avatar */}
          <Avatar className="size-8 rounded-lg shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg text-xs">
              {getInitials(user.name) || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Name + Email — hidden in icon mode */}
          <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium text-sm">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>

          {/* Logout button — inline, muted, dotted border */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center size-7 rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-all shrink-0 group-data-[collapsible=icon]:hidden"
            title="Log out"
          >
            <IconLogout className="size-3.5" />
          </button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
