"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <Link href="/map" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        Map
      </Link>
      <Link href="/locations" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        Browse
      </Link>
      {loggedIn && (
        <>
          <QuickSaveModal />
          <Link href="/add" className={cn(buttonVariants({ size: "sm" }))}>
            + Add Location
          </Link>
        </>
      )}
    </div>
  );
}
