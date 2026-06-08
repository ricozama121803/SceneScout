"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Map, Search, Plus, User, Store } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { QuickSaveModal } from "@/components/layout/QuickSaveModal";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const close = () => setOpen(false);

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
          <div className="fixed inset-0 z-40 bg-black/20" onClick={close} />
          <nav className="fixed inset-x-0 top-[65px] z-50 border-b-2 border-border bg-background shadow-[0_4px_0_0_#000]">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">

              {/* Personal */}
              {[
                { href: "/map", label: "Map", icon: Map },
                { href: "/locations", label: "Browse", icon: Search },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={close} className={cn(buttonVariants({ variant: "ghost" }), "justify-start gap-3 h-12 w-full text-base font-bold")}>
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
              {loggedIn && (
                <>
                  <QuickSaveModal triggerClassName={cn(buttonVariants({ variant: "ghost" }), "justify-start gap-3 h-12 w-full text-base font-bold")} />
                  <Link href="/add" onClick={close} className={cn(buttonVariants({ variant: "ghost" }), "justify-start gap-3 h-12 w-full text-base font-bold")}>
                    <Plus className="h-5 w-5" />
                    Add Location
                  </Link>
                  <Link href="/profile" onClick={close} className={cn(buttonVariants({ variant: "ghost" }), "justify-start gap-3 h-12 w-full text-base font-bold")}>
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                </>
              )}

              {/* Spaces for rent — labeled section */}
              <div className="mt-2 pt-2 border-t-2 border-emerald-300">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 pb-1.5 flex items-center gap-1.5">
                  <Store className="h-3 w-3" />
                  Spaces for Rent
                </p>
                <Link href="/rentals" onClick={close} className={cn(buttonVariants({ variant: "ghost" }), "justify-start gap-3 h-12 w-full text-base font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800")}>
                  <Store className="h-5 w-5" />
                  Rent a Space
                </Link>
                {loggedIn && (
                  <Link href="/business" onClick={close} className={cn(buttonVariants({ variant: "ghost" }), "justify-start gap-3 h-12 w-full text-base font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800")}>
                    <Store className="h-5 w-5" />
                    My Spaces
                  </Link>
                )}
              </div>

            </div>
          </nav>
        </>
      )}
    </>
  );
}
