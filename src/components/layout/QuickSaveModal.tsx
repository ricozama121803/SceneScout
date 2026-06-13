"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { PhotoUploadField } from "@/components/forms/PhotoUploadField";
import { quickSaveLocation } from "@/lib/actions/locations";

function generateDraftName(): string {
  return `Draft – ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
}

type GpsState = "idle" | "requesting" | "granted" | "denied";

interface QuickSaveModalProps {
  triggerClassName?: string;
  isLoggedIn?: boolean;
}

export function QuickSaveModal({ triggerClassName, isLoggedIn = true }: QuickSaveModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "auth-prompt">("form");
  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function requestGps() {
    setGpsState("requesting");
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ lat: c.latitude, lng: c.longitude });
        setGpsState("granted");
      },
      () => setGpsState("denied")
    );
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setStep("form");
      setGpsState("idle");
      setCoords(null);
      setPhotoPaths([]);
      setError(null);
      requestGps();
    }
  }

  function handleSubmit() {
    if (!isLoggedIn) {
      setStep("auth-prompt");
      return;
    }
    if (!coords) { setError("Location access is required. Please enable GPS and retry."); return; }
    if (photoPaths.length === 0) { setError("Please upload at least one photo."); return; }
    setError(null);

    startTransition(async () => {
      const result = await quickSaveLocation({
        lat: coords.lat,
        lng: coords.lng,
        photo_path: photoPaths[0],
        name: generateDraftName(),
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
      router.push("/profile?tab=drafts");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className={triggerClassName ?? "flex h-9 items-center gap-1.5 rounded-md border-2 border-border bg-green-500 hover:bg-green-400 px-3 text-sm font-semibold text-white transition-colors"}
        aria-label="Quick save location"
      >
        <Camera className="h-4 w-4" />
        Quick Add
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm">
          {step === "auth-prompt" ? (
            <>
              <DialogHeader>
                <DialogTitle>Sign in to save</DialogTitle>
                <DialogDescription>
                  Create a free account to save locations and fill in the details later.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-col">
                <Button className="w-full" onClick={() => router.push("/signup")}>
                  Sign Up Free
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
                  Sign In
                </Button>
                <DialogClose render={<Button variant="ghost" className="w-full" />}>
                  Cancel
                </DialogClose>
              </DialogFooter>
            </>
          ) : (
          <>
          <DialogHeader>
            <DialogTitle>Quick Save Location</DialogTitle>
            <DialogDescription>
              Snap and save — fill in the details later from your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* GPS status */}
            <div className="flex items-center gap-2 text-sm">
              {gpsState === "requesting" && (
                <>
                  <Spinner className="h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground">Detecting your location…</span>
                </>
              )}
              {gpsState === "granted" && coords && (
                <>
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                </>
              )}
              {gpsState === "denied" && (
                <div className="flex w-full items-center justify-between rounded-md border-2 border-destructive/40 bg-destructive/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <span className="text-xs text-destructive">Location access denied</span>
                  </div>
                  <button
                    type="button"
                    onClick={requestGps}
                    className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Photo upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Photo</label>
              <PhotoUploadField maxFiles={1} onChange={setPhotoPaths} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending} className="gap-1.5">
              {isPending && <Spinner className="h-4 w-4" />}
              {isPending ? "Saving…" : "Save Draft"}
            </Button>
          </DialogFooter>
          </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
