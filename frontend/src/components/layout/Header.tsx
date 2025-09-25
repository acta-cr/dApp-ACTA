"use client";

import useIsMobile from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import useHeader from "@/hooks/useHeader";
import useScrollHeader from "@/hooks/useScrollHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Wallet } from "./Wallet";

const Header = ({ className }: { className?: string }) => {
  const isMobile = useIsMobile();
  const { pathName, getBreadCrumbs, address } = useHeader();
  const { isScrolled } = useScrollHeader();

  return (
    <header
      className={cn(
        "flex flex-1 h-12 sm:h-16 shrink-0 items-center gap-2 transition-all duration-300 ease-in-out group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 mt-1 sm:mt-4 mb-1 sm:mb-4 px-3 sm:px-6",
        isScrolled && "sticky top-0 z-50",
        isScrolled
          ? "bg-background/60 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-background",
        className,
      )}
    >
      <div className="flex flex-row w-full justify-between items-center gap-2 sm:gap-4">
        {pathName !== "/" && address ? (
          <>
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <SidebarTrigger
                className={cn(
                  "h-7 w-7 sm:h-10 sm:w-10 z-0 flex-shrink-0",
                  isMobile ? "relative" : "relative",
                )}
              />

              <Breadcrumb className="hidden sm:block flex-1 min-w-0">
                <BreadcrumbList>{getBreadCrumbs()}</BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex gap-1 sm:gap-3 items-center flex-shrink-0">
              <Wallet />
            </div>
          </>
        ) : (
          <div className="flex gap-1 sm:gap-3 ml-auto items-center">
            <Wallet />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;