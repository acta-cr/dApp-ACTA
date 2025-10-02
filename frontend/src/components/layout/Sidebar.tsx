"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  User,
  LogOut,
  FileText,
  ChevronRight,
  BookOpen,
  ChevronsUpDown,
  CircleHelp,
  LucideIcon,
} from "lucide-react";
import Footer from "./Footer";
import Header from "./Header";

interface AppSidebarProps {
  children?: React.ReactNode;
}

// Team data for header
const teams = [
  {
    name: "ACTA",
    logo: "/logo.png",
    plan: "Infrastructure for digital trust.",
  },
];

// Type for teams
type Team = {
  name: string;
  logo: string;
  plan: string;
};

// Types for navigation items
interface SubItem {
  title: string;
  url: string;
  isExternal?: boolean;
}

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isExpandable?: boolean;
  isExternal?: boolean;
  items?: SubItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Navigation groups structure similar to Trustless-Work
const navGroups: NavGroup[] = [
  {
    label: "Platform",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
        isExpandable: false,
      },
    ],
  },
  {
    label: "Credentials",
    items: [
      {
        title: "Credentials",
        url: "#",
        icon: FileText,
        isExpandable: true,
        items: [
          {
            title: "Create",
            url: "/dashboard/credentials",
          },
          {
            title: "Search",
            url: "/dashboard/search-credential",
          },
          {
            title: "My Credentials",
            url: "/dashboard/my-credentials",
          },
        ],
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        title: "Resources",
        url: "#",
        icon: BookOpen,
        isExpandable: true,
        items: [
          {
            title: "Documentation",
            url: "https://docs.acta.build",
            isExternal: true,
          },
          {
            title: "Stellar Expert",
            url: "https://stellar.expert/explorer/testnet",
            isExternal: true,
          },
          {
            title: "Website",
            url: "https://acta.build",
            isExternal: true,
          },
        ],
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        title: "Help",
        url: "/dashboard/help",
        icon: CircleHelp,
        isActive: true,
        isExpandable: false,
      },
    ],
  },
];

// Team Switcher Component
function TeamSwitcher({ teams }: { teams: Team[] }) {
  const [activeTeam] = useState(teams[0]);

  return (
    <SidebarMenu className="mt-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Link href="/dashboard">
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Image
                  width={40}
                  height={40}
                  src={activeTeam.logo}
                  alt={activeTeam.name}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeTeam.name}
                  </span>
                  <span className="truncate text-xs">{activeTeam.plan}</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Navigation Main Component
function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "#") return false;
    if (itemUrl.startsWith("http")) return false;
    if (itemUrl === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === itemUrl || pathname.startsWith(itemUrl);
  };

  const isSubItemActive = (subItemUrl: string) => {
    if (subItemUrl.startsWith("http")) return false;
    return pathname === subItemUrl;
  };

  return (
    <>
      {groups.map(group => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map(item => (
              <SidebarMenuItem key={item.title}>
                {item.isExpandable ? (
                  <Collapsible
                    defaultOpen={
                      group.label === "Resources" ||
                      group.label === "Credentials"
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map(subItem => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubItemActive(subItem.url)}
                            >
                              <Link
                                href={subItem.url}
                                target={
                                  subItem.isExternal ? "_blank" : undefined
                                }
                                rel={
                                  subItem.isExternal
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                              >
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild isActive={isItemActive(item.url)}>
                    <Link
                      href={item.url}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

// Navigation User Component
function NavUser() {
  const { handleDisconnect, walletAddress } = useWallet();

  const user = {
    name: "User",
    address: walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "No wallet connected",
    avatar: "",
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">U</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.address}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">U</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.address}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/dashboard/profile">
                <DropdownMenuItem>
                  <User />
                  Profile
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleDisconnect}>
                <LogOut />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Main App Sidebar Component
function AppSidebar() {
  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </SidebarPrimitive>
  );
}

export default function Sidebar({ children }: AppSidebarProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <div className="flex flex-1 flex-col bg-transparent">
          <div className="flex-1 py-4 px-6 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
