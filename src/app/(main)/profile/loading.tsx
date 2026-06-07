import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm font-bold text-muted-foreground">Loading profile…</p>
    </div>
  );
}
