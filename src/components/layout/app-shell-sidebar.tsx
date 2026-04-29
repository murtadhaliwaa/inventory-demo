"use client"

import { useEffect } from "react"
import {
  Factory,
  LayoutGrid,
  ListTree,
  LogOut,
  Package,
  ScrollText,
  ClipboardList,
  Truck,
  X,
} from "lucide-react"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "اللوحة", icon: LayoutGrid },
  { href: "/operations", label: "العمليات اليومية", icon: ClipboardList },
  { href: "/items", label: "المواد", icon: Package },
  { href: "/suppliers", label: "الموردون", icon: Truck },
  { href: "/reports/daily", label: "التقرير اليومي", icon: ScrollText },
]

export function AppShellSidebar() {
  const path = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    if (isMobile) setOpenMobile(false)
  }, [path, isMobile, setOpenMobile])

  return (
    <Sidebar
      side="right"
      className="border-s border-sidebar-border shadow-[var(--wms-surface-mid)]"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border/90 bg-sidebar/50 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] backdrop-blur-[2px]">
        <div className="flex w-full flex-1 items-start justify-between gap-2 overflow-hidden text-right text-sm font-semibold leading-tight text-sidebar-foreground group-data-[collapsible=icon]:px-0">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden pr-0.5">
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
          {isMobile ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 min-h-11 min-w-11 shrink-0 touch-manipulation rounded-xl"
              onClick={() => setOpenMobile(false)}
              aria-label="إغلاق القائمة"
            >
              <X className="size-5" />
            </Button>
          ) : null}
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
                      size="lg"
                      isActive={active}
                      className={cn(
                        "touch-manipulation justify-end rounded-xl py-3 transition-[background-color,box-shadow,border-color] group-data-[collapsible=icon]:py-2!",
                        active && "shadow-[var(--wms-surface-elevated)]"
                      )}
                    >
                      <Link
                        href={href}
                        prefetch
                        onClick={() => {
                          if (isMobile) setOpenMobile(false)
                        }}
                        className={cn(
                          "flex min-h-10 w-full items-center justify-end gap-2 rounded-xl py-1 !text-start sm:min-h-0",
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
      <SidebarFooter className="border-t border-sidebar-border gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
        <form action={signOut} className="w-full">
          {isSupabaseConfigured() && (
            <Button
              type="submit"
              size="default"
              variant="outline"
              className="min-h-11 w-full touch-manipulation justify-end gap-2"
            >
              <span>خروج</span>
              <LogOut className="size-3.5" />
            </Button>
          )}
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
