import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddRentalListingForm } from "@/components/forms/AddRentalListingForm";

export const metadata = { title: "List Your Space" };

export default async function NewRentalListingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Prefill from one of the user's own community locations.
  let initial: React.ComponentProps<typeof AddRentalListingForm>["initial"];
  if (from) {
    const { data: source } = await supabase
      .from("locations")
      .select("name, description, address, lat, lng, user_id")
      .eq("id", from)
      .single();
    if (source && source.user_id === user.id) {
      initial = {
        name: source.name,
        description: source.description ?? "",
        address: source.address ?? "",
        lat: source.lat,
        lng: source.lng,
      };
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black">List Your Space</h1>
        <p className="text-muted-foreground mt-1">
          A home, pool, rooftop, studio, storefront — if you own it and it photographs well, list it.
        </p>
      </div>
      <AddRentalListingForm initial={initial} />
    </div>
  );
}
