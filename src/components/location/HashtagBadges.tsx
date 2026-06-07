import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Hashtag } from "@/types/location";

interface HashtagBadgesProps {
  hashtags: Hashtag[];
  linkable?: boolean;
  className?: string;
}

const COLORS = ["secondary", "accent", "pink"] as const;

export function HashtagBadges({ hashtags, linkable = true, className }: HashtagBadgesProps) {
  if (!hashtags.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {hashtags.map((tag, i) => {
        const variant = COLORS[i % COLORS.length];
        return linkable ? (
          <Link key={tag.id} href={`/locations?tag=${tag.name}`}>
            <Badge
              variant={variant}
              className="cursor-pointer transition-all shadow-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              #{tag.name}
            </Badge>
          </Link>
        ) : (
          <Badge key={tag.id} variant={variant}>
            #{tag.name}
          </Badge>
        );
      })}
    </div>
  );
}
