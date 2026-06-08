import { getRentalListings } from "@/lib/queries/rentals";
import { RentalListingCard } from "@/components/rental/RentalListingCard";
import { Store } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Rent a Space" };

export default async function RentalsPage() {
  const listings = await getRentalListings();

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Rent a Space</h1>
          <p className="text-muted-foreground mt-1">
            Homes, pools, rooftops, studios &amp; more — private spaces available for shoots and productions.
          </p>
        </div>
        <Link href="/business" className={buttonVariants({ variant: "outline" })}>
          List Your Space
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <Store className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-bold">No spaces listed yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Be the first to list a space — any home, studio, or venue you own.
          </p>
          <Link href="/business" className={buttonVariants()}>
            List Your Space
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <RentalListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
