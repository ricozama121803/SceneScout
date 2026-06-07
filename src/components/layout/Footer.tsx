import Link from "next/link";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-foreground text-background mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-black text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-background bg-primary">
            <MapPin className="h-3 w-3 text-primary-foreground" />
          </div>
          SceneScout — built for student filmmakers
        </div>
        <nav className="flex gap-6 text-sm font-bold">
          <Link href="/map" className="hover:text-accent transition-colors">Map</Link>
          <Link href="/locations" className="hover:text-accent transition-colors">Browse</Link>
          <Link href="/add" className="hover:text-secondary transition-colors">Add Location</Link>
        </nav>
      </div>
    </footer>
  );
}
