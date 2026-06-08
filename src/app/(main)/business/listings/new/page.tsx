import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddRentalListingForm } from "@/components/forms/AddRentalListingForm";

export const metadata = { title: "List Your Space" };

export default async function NewRentalListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black">List Your Space</h1>
        <p className="text-muted-foreground mt-1">
          A home, pool, rooftop, studio, storefront — if you own it and it photographs well, list it.
        </p>
      </div>
      <AddRentalListingForm />
    </div>
  );
}
