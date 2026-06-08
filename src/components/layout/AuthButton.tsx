"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface Profile { username: string; avatar_url: string | null }

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userId)
        .single();
      setProfile(data as Profile | null);
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) load(data.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) load(session.user.id);
      else setProfile(null);
    });

    const onAvatarUpdated = (e: Event) => {
      const { avatarUrl } = (e as CustomEvent<{ avatarUrl: string }>).detail;
      setProfile((p) => p ? { ...p, avatar_url: avatarUrl } : null);
    };
    window.addEventListener("avatar-updated", onAvatarUpdated);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("avatar-updated", onAvatarUpdated);
    };
  }, []);

  if (loading) {
    return <div className="h-9 w-20 rounded-lg bg-muted border-2 border-border animate-pulse hidden md:block" />;
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
      <Link href="/profile" aria-label="Your profile">
        <Avatar className="h-8 w-8 border-2 border-border hover:opacity-80 transition-opacity">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs font-bold">
            {(profile?.username ?? user.email ?? "?")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <form action={signOut}>
        <Button variant="outline" size="sm" type="submit">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
