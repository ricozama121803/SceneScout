"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/lib/actions/comments";

export function CommentForm({ locationId }: { locationId: string }) {
  const [content, setContent] = useState("");
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addComment(locationId, content.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts about this location…"
        rows={3}
        maxLength={500}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={!content.trim()}>
        Post Comment
      </Button>
    </form>
  );
}
