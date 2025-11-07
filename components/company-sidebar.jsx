"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Plus,
  Users,
  Calendar,
  Settings,
  LogOut,
  Building2,
  Globe,
  UserCircle,
  Bell,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigationItems = [
  {
    title: "Dashboard",
    titleDa: "Dashboard",
    url: "/dashboard/company",
    icon: LayoutDashboard,
    badge: false,
  },
  {
    title: "Add Role",
    titleDa: "Tilføj Rolle",
    url: "/dashboard/company/add-role",
    icon: Plus,
    badge: false,
  },
  {
    title: "Matches",
    titleDa: "Match",
    url: "/dashboard/company/matches",
    icon: Users,
    badge: true,
  },
  {
    title: "Interviews",
    titleDa: "Samtaler",
    url: "/dashboard/company/interviews",
    icon: Calendar,
    badge: true,
  },
  {
    title: "Notifications",
    titleDa: "Notifikationer",
    url: "/dashboard/company/notifications",
    icon: Bell,
    badge: true,
  },
  {
    title: "Settings",
    titleDa: "Indstillinger",
    url: "/dashboard/company/settings",
    icon: Settings,
    badge: false,
  },
];

export function CompanySidebar() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const locale = params?.locale || "da";
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const { isMobile, open, setOpen, toggleSidebar } = useSidebar();
  const [mounted, setMounted] = React.useState(false);
  const [counts, setCounts] = React.useState({});

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCounts = React.useCallback(async () => {
    if (!token) {
      setCounts({});
      return;
    }
    try {
      const res = await fetch("/api/notifications/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return;
      }

      const text = await res.text();
      if (!res.headers.get("content-type")?.includes("application/json")) {
        console.error("⚠️ Non-JSON response when fetching company summary counts", text);
        return;
      }
      try {
        const data = JSON.parse(text || "{}");
        setCounts(data.counts || {});
      } catch (error) {
        console.error("⚠️ Failed to parse company sidebar counts", error, text);
      }
    } catch (error) {
      console.error("⚠️ Failed to load company sidebar counts", error);
    }
  }, [token]);

  React.useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const listener = () => fetchCounts();
    window.addEventListener("notifications:refresh", listener);
    return () => window.removeEventListener("notifications:refresh", listener);
  }, [fetchCounts]);

  // Close sidebar on mobile when route changes
  React.useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
    }
  }, [pathname, isMobile]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    router.push(`/${locale}/auth/login`);
  };

  const changeLocale = (newLocale) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const getInitials = (firstName, lastName) => {
    if (!mounted) return "DI";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "DI";
  };

  const formatCount = (value) => {
    if (!value) return 0;
    return value > 99 ? "99+" : value;
  };

  const getBadgeCount = (url) => {
    const map = {
      "/dashboard/company/notifications": "notificationCount",
      "/dashboard/company/matches": "matchCount",
      "/dashboard/company/interviews": "interviewCount",
    };

    const key = map[url];
    if (!key) return 0;
    return counts[key] || 0;
  };

  const isActiveRoute = (url) => {
    if (!pathname) return false;
    
    // Build the full URL with locale
    const fullUrl = `/${locale}${url}`;
    
    // Exact match for dashboard home
    if (url === '/dashboard/company') {
      return pathname === fullUrl;
    }
    
    // For other routes, match exactly or with sub-paths
    return pathname === fullUrl || pathname.startsWith(fullUrl + '/');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 md:hidden bg-white/90 backdrop-blur-sm shadow-lg border border-[#d4d4d4] hover:bg-[#f5f5f5] hover:border-[#2b2b2b] transition-all duration-200"
        >
          {open ? <X className="h-5 w-5 text-[#2b2b2b]" /> : <Menu className="h-5 w-5 text-[#2b2b2b]" />}
        </Button>
      )}

      <Sidebar collapsible="icon" className="border-r border-[#d4d4d4]">
        <SidebarHeader className="border-b border-[#d4d4d4] bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="h-16 hover:bg-[#f5f5f5] transition-colors duration-200 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center gap-3">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-[#2b2b2b] text-white shadow-lg group-data-[collapsible=icon]:size-6">
                    <Building2 className="size-5 group-data-[collapsible=icon]:size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-bold text-lg text-[#2b2b2b]">Praktikplats</span>
                    <span className="truncate text-xs text-[#737373] font-medium">Company Portal</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Language Switcher */}
          <SidebarMenu className="mt-2">
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild suppressHydrationWarning>
                  <SidebarMenuButton 
                    size="lg" 
                    className="h-12 hover:bg-[#f5f5f5] transition-colors duration-200 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center" 
                    suppressHydrationWarning
                  >
                    <Globe className="size-5 text-[#525252]" />
                    <span className="text-base font-medium text-[#2b2b2b] group-data-[collapsible=icon]:hidden">
                      {locale === "da" ? "Dansk" : locale === "sv" ? "Svenska" : "English"}
                    </span>
                    <ChevronRight className="ml-auto size-4 text-[#737373] group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 border-[#d4d4d4]">
                  <DropdownMenuItem 
                    onClick={() => changeLocale("da")} 
                    className="text-base py-2.5 cursor-pointer hover:bg-[#f5f5f5]"
                  >
                    <span className="mr-2">🇩🇰</span> Dansk
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => changeLocale("en")} 
                    className="text-base py-2.5 cursor-pointer hover:bg-[#f5f5f5]"
                  >
                    <span className="mr-2">🇬🇧</span> English
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => changeLocale("sv")} 
                    className="text-base py-2.5 cursor-pointer hover:bg-[#f5f5f5]"
                  >
                    <span className="mr-2">🇸🇪</span> Svenska
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="bg-white">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold text-[#737373] uppercase tracking-wide px-4 py-3 group-data-[collapsible=icon]:hidden">
              {locale === "da" ? "Navigation" : "Navigation"}
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1 px-2 group-data-[collapsible=icon]:px-0">
              <TooltipProvider>
                {navigationItems.map((item) => {
                  const isActive = isActiveRoute(item.url);
                  const badgeCount = item.badge ? getBadgeCount(item.url) : 0;
                  
                  return (
                    <SidebarMenuItem key={item.url}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            size="lg" 
                            onClick={() => router.push(`/${locale}${item.url}`)}
                            className={`h-12 rounded-lg transition-all duration-200 cursor-pointer group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 ${
                              isActive 
                                ? 'bg-[#2b2b2b] text-white hover:bg-[#525252] shadow-md' 
                                : 'hover:bg-[#f5f5f5] text-[#2b2b2b] hover:text-[#525252]'
                            }`}
                          >
                            <item.icon className={`size-5 shrink-0 ${isActive ? 'text-white' : 'text-[#525252]'}`} />
                            <span className={`text-base font-medium group-data-[collapsible=icon]:hidden ${isActive ? 'text-white' : ''}`}>
                              {locale === "da" ? item.titleDa : item.title}
                            </span>
                            {badgeCount > 0 && (
                              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full group-data-[collapsible=icon]:hidden ${
                                isActive 
                                  ? 'bg-white text-[#2b2b2b]' 
                                  : 'bg-[#2b2b2b] text-white'
                              }`}>
                                {formatCount(badgeCount)}
                              </span>
                            )}
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#2b2b2b] text-white">
                          <p>{locale === "da" ? item.titleDa : item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-[#d4d4d4] bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild suppressHydrationWarning>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-[#f5f5f5] h-16 hover:bg-[#f5f5f5] transition-all duration-200 border border-transparent hover:border-[#d4d4d4] group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                    suppressHydrationWarning
                  >
                    <Avatar className="h-10 w-10 rounded-xl ring-2 ring-[#d4d4d4] group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:ring-1">
                      <AvatarFallback className="rounded-xl text-base font-bold bg-[#2b2b2b] text-white group-data-[collapsible=icon]:text-xs" suppressHydrationWarning>
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold text-sm text-[#2b2b2b]" suppressHydrationWarning>
                        {mounted ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User" : "User"}
                      </span>
                      <span className="truncate text-xs text-[#737373]" suppressHydrationWarning>
                        {mounted ? user?.email || "" : ""}
                      </span>
                    </div>
                    <ChevronRight className="ml-auto size-4 text-[#737373] group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 rounded-xl border-[#d4d4d4] shadow-xl"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={8}
                >
                  <div className="px-3 py-3 border-b border-[#d4d4d4]">
                    <p className="text-sm font-semibold text-[#2b2b2b]" suppressHydrationWarning>
                      {mounted ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User" : "User"}
                    </p>
                    <p className="text-xs text-[#737373] mt-0.5" suppressHydrationWarning>
                      {mounted ? user?.email || "" : ""}
                    </p>
                  </div>
                  <DropdownMenuItem 
                    onClick={() => router.push(`/${locale}/dashboard/company/settings`)} 
                    className="text-base py-3 cursor-pointer hover:bg-[#f5f5f5]"
                  >
                    <Settings className="size-5 mr-3 text-[#525252]" />
                    {locale === "da" ? "Indstillinger" : "Settings"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#d4d4d4]" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-base py-3 cursor-pointer hover:bg-[#f5f5f5] text-[#737373] focus:text-[#2b2b2b]"
                  >
                    <LogOut className="size-5 mr-3" />
                    {locale === "da" ? "Log ud" : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
