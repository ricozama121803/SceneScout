import Link from "next/link";
import { AuthButton } from "./AuthButton";
import { MobileNav } from "./MobileNav";
import { MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-primary shadow-shadow-sm">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          SceneScout
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/map" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Map
          </Link>
          <Link href="/locations" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Browse
          </Link>
          <Link href="/add" className={cn(buttonVariants({ size: "sm" }))}>
            + Add Location
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <AuthButton />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
