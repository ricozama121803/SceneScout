"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { getUploadUrl } from "@/lib/actions/photos";

interface PhotoUploadFieldProps {
  onChange: (paths: string[]) => void;
  maxFiles?: number;
}

interface UploadedPhoto {
  path: string;
  previewUrl: string;
}

export function PhotoUploadField({ onChange, maxFiles = 5 }: PhotoUploadFieldProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    if (photos.length + files.length > maxFiles) {
      setError(`You can upload at most ${maxFiles} photos`);
      return;
    }

    setUploading(true);
    setError(null);

    const uploaded: UploadedPhoto[] = [];

    for (const file of Array.from(files)) {
      const result = await getUploadUrl(file.name);
      if ("error" in result) {
        setError(result.error ?? "Upload failed");
        break;
      }

      const res = await fetch(result.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) {
        setError("Upload failed. Please try again.");
        break;
      }

      uploaded.push({ path: result.path, previewUrl: URL.createObjectURL(file) });
    }

    const newPhotos = [...photos, ...uploaded];
    setPhotos(newPhotos);
    onChange(newPhotos.map((p) => p.path));
    setUploading(false);
  }

  function remove(index: number) {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onChange(newPhotos.map((p) => p.path));
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">
          {uploading ? "Uploading…" : "Click or drag photos here"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG, WebP — up to {maxFiles} photos, 5 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div key={photo.path} className="relative aspect-video rounded-lg overflow-hidden group">
              <Image
                src={photo.previewUrl}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 150px"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
