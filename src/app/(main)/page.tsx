import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocationGrid } from "@/components/location/LocationGrid";
import { getTrending, getTopRated } from "@/lib/queries/locations";
import { MapPin, Plus, TrendingUp, Star, Clapperboard } from "lucide-react";

export default async function HomePage() {
  const [trending, topRated] = await Promise.all([getTrending(6), getTopRated(6)]);

  return (
    <div className="pb-16">
      {/* Hero — sunny yellow background */}
      <section className="bg-accent border-b-2 border-border py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-background border-2 border-border px-4 py-1.5 text-sm font-bold shadow-shadow-sm rounded-sm">
            <Clapperboard className="h-4 w-4" />
            Built for student filmmakers
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
            Find Your Perfect<br />
            <span className="text-primary">Filming Location</span>
          </h1>
          <p className="text-foreground/70 text-lg max-w-xl mx-auto font-medium">
            Discover community-curated filming spots near you. Filter by hashtags, read tips from
            fellow filmmakers, and share your own hidden gems.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/map" className={cn(buttonVariants({ size: "lg" }))}>
              <MapPin className="h-4 w-4" />
              Explore the Map
            </Link>
            <Link href="/add" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              <Plus className="h-4 w-4" />
              Add a Location
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-b-2 border-border bg-primary">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-bold text-primary-foreground">
          <span>🎬 Community-curated spots</span>
          <span>📍 Drop-pin location adding</span>
          <span>⭐ Filmmaker reviews &amp; tips</span>
          <span>🔖 Save your favourites</span>
        </div>
      </div>

      {/* Trending */}
      <section className="container mx-auto px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-secondary border-2 border-border shadow-shadow-sm rounded-md">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black">Trending This Week</h2>
          </div>
          <Link
            href="/locations"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            View all →
          </Link>
        </div>
        <LocationGrid
          locations={trending}
          emptyMessage="No locations yet — be the first to add one!"
        />
      </section>

      {/* Top Rated */}
      <section className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-accent border-2 border-border shadow-shadow-sm rounded-md">
              <Star className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black">Highest Rated</h2>
          </div>
          <Link
            href="/locations"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            View all →
          </Link>
        </div>
        <LocationGrid
          locations={topRated}
          emptyMessage="No rated locations yet. Rate a location to see it here!"
        />
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pt-8">
        <div className="bg-secondary border-2 border-border shadow-shadow rounded-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-black">Know a great spot?</h2>
          <p className="text-foreground/70 font-medium max-w-md mx-auto">
            Help the community by sharing your filming locations with hashtags, tips, and photos.
          </p>
          <Link href="/add" className={cn(buttonVariants({ size: "lg" }))}>
            <Plus className="h-4 w-4" />
            Add Your Location
          </Link>
        </div>
      </section>
    </div>
  );
}
