"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Map, Search, Plus, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/locations", label: "Browse", icon: Search },
  { href: "/add", label: "Add Location", icon: Plus },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed inset-x-0 top-[65px] z-50 border-b-2 border-border bg-background shadow-[0_4px_0_0_#000]">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "justify-start gap-3 h-12 w-full text-base font-bold"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
