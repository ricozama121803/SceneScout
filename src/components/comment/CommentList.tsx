import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils/formatters";
import type { Comment, Profile } from "@/types/location";

interface CommentListProps {
  comments: (Comment & { profile: Profile })[];
}

export function CommentList({ comments }: CommentListProps) {
  if (!comments.length) {
    return <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={comment.profile.avatar_url ?? undefined} />
            <AvatarFallback>{comment.profile.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{comment.profile.username}</span>
              <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-sm text-foreground/80">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
