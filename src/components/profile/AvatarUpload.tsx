"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { getAvatarUploadUrl } from "@/lib/actions/photos";
import { updateAvatarUrl } from "@/lib/actions/profile";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  username: string;
}

export function AvatarUpload({ currentAvatarUrl, username }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    const urlResult = await getAvatarUploadUrl(file.name);
    if ("error" in urlResult) {
      setError(urlResult.error ?? "Upload failed");
      setUploading(false);
      return;
    }

    const res = await fetch(urlResult.signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!res.ok) {
      setError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const result = await updateAvatarUrl(urlResult.path);
    if ("error" in result) {
      setError(result.error);
      setUploading(false);
      return;
    }

    setPreview(result.avatarUrl);
    setUploading(false);

    // Notify the navbar avatar to update without a page reload
    window.dispatchEvent(new CustomEvent("avatar-updated", { detail: { avatarUrl: result.avatarUrl } }));
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative group focus:outline-none"
        aria-label="Change profile picture"
      >
        <Avatar className="h-16 w-16 border-2 border-border">
          <AvatarImage src={preview ?? undefined} />
          <AvatarFallback className="text-xl font-bold">
            {username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Spinner className="h-5 w-5 text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
