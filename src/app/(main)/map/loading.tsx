import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-65px)] items-center justify-center bg-muted border-t-2 border-border">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-bold text-muted-foreground">Loading map…</p>
      </div>
    </div>
  );
}
