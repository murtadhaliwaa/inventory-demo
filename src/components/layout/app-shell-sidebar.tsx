"use client"

import { Factory, LayoutGrid, ListTree, LogOut, Package, ScrollText, ClipboardList } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { isSupabaseConfigured } from "@/lib/env"
import { signOut } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "اللوحة", icon: LayoutGrid },
  { href: "/operations", label: "العمليات اليومية", icon: ClipboardList },
  { href: "/items", label: "المواد", icon: Package },
  { href: "/reports/daily", label: "التقرير اليومي", icon: ScrollText },
]

export function AppShellSidebar() {
  const path = usePathname()

  return (
    <Sidebar
      side="right"
      className="border-s border-sidebar-border shadow-[var(--wms-surface-mid)]"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border/90 bg-sidebar/50 px-3 py-3 backdrop-blur-[2px]">
        <div className="flex flex-1 items-center gap-2 overflow-hidden pr-0.5 text-right text-sm font-semibold leading-tight text-sidebar-foreground group-data-[collapsible=icon]:px-0">
          <div className="bg-sidebar-primary/20 ring-sidebar-primary/15 flex size-9 shrink-0 items-center justify-center rounded-xl ring-1">
            <Factory className="text-sidebar-primary size-4" />
          </div>
          <span className="min-w-0 break-words">
            المهند
            <br />
            <span className="text-[11px] font-medium text-sidebar-foreground/60">
              AL-MUHANAD
            </span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">القائمة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ href, label, icon: Icon }) => {
                const active =
                  path === href || (href !== "/" && Boolean(path?.startsWith(href)))
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "justify-end rounded-xl transition-[background-color,box-shadow,border-color]",
                        active && "shadow-[var(--wms-surface-elevated)]"
                      )}
                    >
                      <Link
                        href={href}
                        className={cn(
                          "w-full rounded-xl !text-start",
                          active &&
                            "border-s-2 border-primary bg-sidebar-accent/90 text-sidebar-accent-foreground"
                        )}
                      >
                        {label}
                        <Icon className="size-4" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-2">
          <Separator className="my-2" />
          <p className="text-[11px] text-muted-foreground/90 text-right">
            <ListTree className="mb-0.5 inline size-3 opacity-50" />
            <br />
            طن · كيلو · قطعة — وتتبع الموردين
          </p>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border gap-2 p-2">
        <form action={signOut} className="w-full">
          {isSupabaseConfigured() && (
            <Button type="submit" size="sm" variant="outline" className="w-full justify-end gap-2">
              <span>خروج</span>
              <LogOut className="size-3.5" />
            </Button>
          )}
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
