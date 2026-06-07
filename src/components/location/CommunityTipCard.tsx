import { Volume2, Users, FileText, Gem, Clock } from "lucide-react";
import { NOISE_LEVELS, CROWD_LEVELS, PERMIT_REQS } from "@/lib/utils/constants";
import type { CommunityTip, Profile } from "@/types/location";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";

interface CommunityTipCardProps {
  tip: CommunityTip & { profile: Profile };
}

export function CommunityTipCard({ tip }: CommunityTipCardProps) {
  const noiseLabelText = tip.noise_level
    ? NOISE_LEVELS.find((n) => n.value === tip.noise_level)?.label
    : null;
  const crowdLabelText = tip.crowd_level
    ? CROWD_LEVELS.find((c) => c.value === tip.crowd_level)?.label
    : null;
  const permitLabelText = tip.permit_req
    ? PERMIT_REQS.find((p) => p.value === tip.permit_req)?.label
    : null;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={tip.profile.avatar_url ?? undefined} />
          <AvatarFallback>{tip.profile.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{tip.profile.username}</p>
          <p className="text-xs text-muted-foreground">{formatDate(tip.created_at)}</p>
        </div>
        {tip.hidden_gem && (
          <Badge variant="secondary" className="ml-auto gap-1 text-xs">
            <Gem className="h-3 w-3" /> Hidden Gem
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {tip.filming_time && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {tip.filming_time}
          </span>
        )}
        {noiseLabelText && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Volume2 className="h-3.5 w-3.5" /> {noiseLabelText}
          </span>
        )}
        {crowdLabelText && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> {crowdLabelText}
          </span>
        )}
        {permitLabelText && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <FileText className="h-3.5 w-3.5" /> {permitLabelText}
          </span>
        )}
      </div>
    </div>
  );
}
