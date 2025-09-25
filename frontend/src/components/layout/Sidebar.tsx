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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  Key,
  LogOut,
  Search,
  Plus,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface AppSidebarProps {
  children?: React.ReactNode;
}

const platformItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/dashboard/api-key",
    label: "API Key",
    icon: Key,
  },
];

const credentialItems = [
  {
    href: "/dashboard/credentials",
    label: "Create",
    icon: Plus,
  },
  {
    href: "/dashboard/my-credentials",
    label: "List",
    icon: FileText,
  },
  {
    href: "/dashboard/search-credential",
    label: "Search",
    icon: Search,
  },
];

function AppSidebar() {
  const { handleDisconnect, walletAddress } = useWallet();
  const pathname = usePathname();
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);

  return (
    <SidebarPrimitive className="border-r backdrop-blur-sm">
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="ACTA Logo"
              width={20}
              height={20}
              className="w-10 h-full"
            />
          </div>
          <div>
            <h1 className="text-base font-semibold">ACTA</h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-1 px-1">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0">
              {platformItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-8 px-2"
                    >
                      <Link href={item.href}>
                        <Icon
                          className="w-4 h-4"
                          style={{ color: "#F0E7CC" }}
                        />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel
            className="text-xs font-medium text-muted-foreground mb-1 px-1 flex items-center justify-between cursor-pointer hover:text-foreground"
            onClick={() => setIsCredentialsOpen(!isCredentialsOpen)}
          >
            <span>Credentials</span>
            {isCredentialsOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </SidebarGroupLabel>
          {isCredentialsOpen && (
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0">
                {credentialItems.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="h-8 px-2"
                      >
                        <Link href={item.href}>
                          <Icon
                            className="w-4 h-4"
                            style={{ color: "#F0E7CC" }}
                          />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-7 h-7 border-2 border-[#F0E7CC] shadow-[0_0_10px_rgba(240,231,204,0.3)] bg-black rounded-full flex items-center justify-center">
            <span className="text-[#F0E7CC] text-xs font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground truncate">
              {walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "No wallet connected"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleDisconnect}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Disconnect</span>
        </Button>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}

export default function Sidebar({ children }: AppSidebarProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4 bg-transparent">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col p-4 bg-transparent">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
