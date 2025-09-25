"use client";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useWalletContext } from "@/providers/wallet.provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const useHeader = () => {
  const { walletAddress } = useWalletContext();
  const pathName = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!walletAddress) {
      router.push("/");
    } else if (pathName === "/") {
      router.push("/dashboard");
    }
  }, [walletAddress, pathName, router]);

  const getBreadCrumbs = () => {
    const crumbs = pathName.split("/").filter(Boolean);

    return crumbs.map((crumb, index) => {
      const href = "/" + crumbs.slice(0, index + 1).join("/");

      const label = crumb
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return (
        <BreadcrumbItem key={href}>
          {index === crumbs.length - 1 ? (
            <BreadcrumbPage>{label}</BreadcrumbPage>
          ) : (
            <>
              <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
              <BreadcrumbSeparator />
            </>
          )}
        </BreadcrumbItem>
      );
    });
  };

  return {
    pathName,
    getBreadCrumbs,
    address: walletAddress,
  };
};

export default useHeader;