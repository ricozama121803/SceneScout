import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-foreground text-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-sm">
            SceneScout — built for student filmmakers
          </div>

          <p className="text-xs uppercase tracking-wide opacity-80">
            Discover and share filming locations.
          </p>
        </div>

        <div className="mt-4 border-t-2 border-background/20 pt-4 text-center text-xs opacity-70">
          © 2026 SceneScout. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
