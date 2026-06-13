import Link from "next/link";

function GhostCard() {
  return (
    <article className="border-2 border-border bg-card rounded-lg overflow-hidden blur-sm select-none" aria-hidden="true">
      <div className="h-48 bg-muted border-b-2 border-border" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </article>
  );
}

export function GuestWall() {
  return (
    <section className="relative -mt-6">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GhostCard />
        <GhostCard />
        <GhostCard />
      </div>
      <div className="mt-6 flex flex-col items-center gap-3 py-8 border-2 border-dashed border-border rounded-lg text-center">
        <p className="font-semibold text-base">Sign in to see all locations</p>
        <p className="text-sm text-muted-foreground">Create a free account to browse the full directory</p>
        <div className="flex gap-3 mt-1">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign Up Free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border-2 border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
