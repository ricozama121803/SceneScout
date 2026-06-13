"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { QuickSaveModal } from "@/components/layout/QuickSaveModal";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l-2 border-border">
      {/* Personal */}
      <Link href="/map" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        Map
      </Link>
      <Link href="/locations" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        Browse
      </Link>
      <QuickSaveModal isLoggedIn={loggedIn} />
      {loggedIn && (
        <Link href="/add" className={cn(buttonVariants({ size: "sm" }))}>
          + Add Location
        </Link>
      )}

      {/* Business — visually separated */}
      <div className="flex items-center gap-1 ml-1 pl-3 border-l-2 border-emerald-400">
        <Store className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <Link
          href="/rentals"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800")}
        >
          Rent a Space
        </Link>
        {loggedIn && (
          <Link
            href="/business"
            className={cn(buttonVariants({ size: "sm" }), "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700")}
          >
            My Spaces
          </Link>
        )}
      </div>
    </div>
  );
}
