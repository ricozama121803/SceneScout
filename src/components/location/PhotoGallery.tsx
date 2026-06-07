"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { LocationPhoto } from "@/types/location";

interface PhotoGalleryProps {
  photos: LocationPhoto[];
  locationName: string;
}

export function PhotoGallery({ photos, locationName }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!photos.length) return null;

  const sorted = [...photos].sort((a, b) => a.display_order - b.display_order);

  function prev() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + sorted.length) % sorted.length));
  }
  function next() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % sorted.length));
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {sorted.map((photo, i) => (
          <button
            key={photo.id}
            className="relative aspect-video overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setLightboxIndex(i)}
          >
            <Image
              src={photo.url}
              alt={`${locationName} photo ${i + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 33vw, 200px"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-6 w-6" />
          </button>
          {sorted.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white p-2 rounded-full hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                className="absolute right-4 text-white p-2 rounded-full hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <div
            className="relative max-w-4xl max-h-[80vh] w-full h-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={sorted[lightboxIndex].url}
              alt={`${locationName} photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <p className="absolute bottom-4 text-white/70 text-sm">
            {lightboxIndex + 1} / {sorted.length}
          </p>
        </div>
      )}
    </>
  );
}
