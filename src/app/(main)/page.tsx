import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocationGrid } from "@/components/location/LocationGrid";
import { CyclingText } from "@/components/ui/CyclingText";
import { getTrending, getTopRated } from "@/lib/queries/locations";
import { MapPin, Plus, TrendingUp, Star, Clapperboard } from "lucide-react";

export default async function HomePage() {
  const [trending, topRated] = await Promise.all([getTrending(6), getTopRated(6)]);

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="bg-accent border-b-2 border-border px-4 py-12 sm:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

            {/* Text side */}
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-background border-2 border-border px-4 py-1.5 text-sm font-bold shadow-shadow-sm rounded-sm">
                <Clapperboard className="h-4 w-4" />
                Built for student & independent filmmakers and photographers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                Find Your Perfect<br />
                <CyclingText />
              </h1>
              <p className="text-foreground/70 text-lg max-w-md font-medium">
                Discover community-curated filming spots near you. Filter by hashtags, read tips from
                fellow filmmakers, and share your own hidden gems.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
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

            {/* Illustration side */}
            <div className="flex-shrink-0 w-56 sm:w-72 md:w-80">
              <div className="relative border-2 border-border shadow-shadow rounded-lg overflow-hidden bg-background p-4">
                <Image
                  src="/scenescout-hero.svg"
                  alt="SceneScout — film projector and map pin"
                  width={320}
                  height={320}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

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
          <Link href="/locations" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
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
          <Link href="/locations" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
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
        <div className="bg-secondary border-2 border-border shadow-shadow rounded-lg p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Image
              src="/scenescout-icon.svg"
              alt="SceneScout icon"
              width={80}
              height={80}
              className="shrink-0"
            />
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-black">Know a great spot?</h2>
              <p className="text-foreground/70 font-medium">
                Help the community by sharing your filming locations with hashtags, tips, and photos.
              </p>
            </div>
            <Link href="/add" className={cn(buttonVariants({ size: "lg" }), "shrink-0")}>
              <Plus className="h-4 w-4" />
              Add Your Location
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
