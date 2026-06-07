"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-9 w-24 rounded-lg bg-muted border-2 border-border animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          Sign In
        </Link>
        <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2">
      <Link href="/profile" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        Profile
      </Link>
      <form action={signOut}>
        <Button variant="outline" size="sm" type="submit">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
