import Link from "next/link";
import Image from "next/image";
import { MapPin, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatters";
import type { DraftSummary } from "@/types/location";

interface DraftLocationCardProps {
  draft: DraftSummary;
}

export function DraftLocationCard({ draft }: DraftLocationCardProps) {
  return (
    <Link href={`/locations/${draft.id}/edit`} className="group block">
      <article className="border-2 border-border bg-card shadow-shadow rounded-lg overflow-hidden transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none">
        <div className="relative h-48 bg-muted border-b-2 border-border">
          {draft.cover_photo_url ? (
            <Image
              src={draft.cover_photo_url}
              alt={draft.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-400 gap-1">
            <Camera className="h-3 w-3" />
            Draft
          </Badge>
        </div>

        <div className="p-4 space-y-1">
          <h3 className="font-black text-base leading-tight line-clamp-1">{draft.name}</h3>
          <p className="text-xs text-muted-foreground">Saved {formatDate(draft.created_at)} — tap to finish</p>
        </div>
      </article>
    </Link>
  );
}
