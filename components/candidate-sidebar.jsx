"use client";

import * as React from "react";
import {
  Briefcase,
  FileText,
  Settings,
  Building2,
  LogOut,
  User,
  Globe,
  LayoutDashboard,
  MessageSquare,
  HelpCircle,
  Search,
  Bell,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigationItems = [
  {
    title: "Dashboard",
    titleDa: "Dashboard",
    url: "/dashboard/candidate",
    icon: LayoutDashboard,
  },
  {
    title: "Browse Internships",
    titleDa: "Browse Praktikpladser",
    url: "/dashboard/candidate/internships",
    icon: Search,
  },
  {
    title: "My Applications",
    titleDa: "Mine Ansøgninger",
    url: "/dashboard/candidate/applications",
    icon: FileText,
  },
  {
    title: "Interviews",
    titleDa: "Interviews",
    url: "/dashboard/candidate/interviews",
    icon: Briefcase,
  },
  {
    title: "Notifications",
    titleDa: "Notifikationer",
    url: "/dashboard/candidate/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    titleDa: "Profil",
    url: "/dashboard/candidate/profile",
    icon: User,
  },
  {
    title: "Messages",
    titleDa: "Beskeder",
    url: "/dashboard/candidate/messages",
    icon: MessageSquare,
  },
  {
    title: "Support",
    titleDa: "Support",
    url: "/dashboard/candidate/support",
    icon: HelpCircle,
  },
];

export function CandidateSidebar() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const locale = params?.locale || "da";
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const { isMobile } = useSidebar();
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
        console.error("⚠️ Non-JSON response when fetching candidate summary counts", text);
        return;
      }
      try {
        const data = JSON.parse(text || "{}");
        setCounts(data.counts || {});
      } catch (error) {
        console.error("⚠️ Failed to parse candidate sidebar counts", error, text);
      }
    } catch (error) {
      console.error("⚠️ Failed to load sidebar counts", error);
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
    if (!mounted) return "DI"; // Default initials during SSR
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "DI";
  };

  const formatCount = (value) => {
    if (!value) return 0;
    return value > 99 ? "99+" : value;
  };

  const getBadgeCount = (url) => {
    const map = {
      "/dashboard/candidate/notifications": "notificationCount",
      "/dashboard/candidate/interviews": "interviewCount",
      "/dashboard/candidate/applications": "applicationCount",
    };

    const key = map[url];
    if (!key) return 0;
    return counts[key] || 0;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-14">
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Building2 className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-base">Denmark Intern</span>
                  <span className="truncate text-xs">Candidate Portal</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Language Switcher */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild suppressHydrationWarning>
                <SidebarMenuButton size="lg" className="h-11" suppressHydrationWarning>
                  <Globe className="size-5" />
                  <span className="text-base">{locale === "da" ? "Dansk" : locale === "sv" ? "Svenska" : "English"}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => changeLocale("da")} className="text-base py-2">
                  🇩🇰 Dansk
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale("en")} className="text-base py-2">
                  🇬🇧 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale("sv")} className="text-base py-2">
                  🇸🇪 Svenska
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold">{locale === "da" ? "Navigation" : "Navigation"}</SidebarGroupLabel>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild size="lg" className="h-12">
                  <a href={`/${locale}${item.url}`}>
                    <item.icon className="size-5" />
                    <span className="text-base font-medium">{locale === "da" ? item.titleDa : item.title}</span>
                  </a>
                </SidebarMenuButton>
                {getBadgeCount(item.url) > 0 ? (
                  <SidebarMenuBadge className="bg-red-500 text-white">
                    {formatCount(getBadgeCount(item.url))}
                  </SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild suppressHydrationWarning>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-14"
                  suppressHydrationWarning
                >
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarFallback className="rounded-lg text-sm font-semibold" suppressHydrationWarning>
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-sm" suppressHydrationWarning>
                      {mounted ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User" : "User"}
                    </span>
                    <span className="truncate text-xs" suppressHydrationWarning>
                      {mounted ? user?.email || "" : ""}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard/candidate/profile`)} className="text-base py-2.5">
                  <User className="size-5 mr-2" />
                  {locale === "da" ? "Profil" : "Profile"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard/candidate/settings`)} className="text-base py-2.5">
                  <Settings className="size-5 mr-2" />
                  {locale === "da" ? "Indstillinger" : "Settings"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-base py-2.5">
                  <LogOut className="size-5 mr-2" />
                  {locale === "da" ? "Log ud" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
