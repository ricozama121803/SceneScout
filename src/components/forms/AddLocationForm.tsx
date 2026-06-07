"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploadField } from "./PhotoUploadField";
import { HashtagSelector } from "./HashtagSelector";
import { createLocation } from "@/lib/actions/locations";
import { CreateLocationSchema, type CreateLocationInput } from "@/types/forms";
import type { Hashtag } from "@/types/location";
import { Spinner } from "@/components/ui/spinner";

const LocationPickerMap = dynamic(
  () => import("./LocationPickerMap").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => <div className="h-72 rounded-xl border bg-muted animate-pulse" />,
  }
);

interface AddLocationFormProps {
  hashtags: Hashtag[];
}

const STEPS = ["Details", "Location", "Photos & Tags"] as const;

export function AddLocationForm({ hashtags }: AddLocationFormProps) {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateLocationInput>({
    resolver: zodResolver(CreateLocationSchema),
    defaultValues: { hashtag_ids: [], photo_paths: [] },
  });

  const watchedLat = watch("lat");
  const watchedLng = watch("lng");

  async function nextStep() {
    const stepFields: (keyof CreateLocationInput)[][] = [
      ["name", "description"],
      ["address", "lat", "lng"],
      ["hashtag_ids", "photo_paths"],
    ];
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => s + 1);
  }

  function onSubmit(data: CreateLocationInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createLocation(data);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Step 1: Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location name *</label>
              <Input placeholder="Abandoned Warehouse on 5th" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Describe the location — what makes it great for filming?"
                rows={4}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Parking notes</label>
              <Input placeholder="Free street parking available on weekends" {...register("parking_notes")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Permit notes</label>
              <Input placeholder="No permit needed for crews under 5" {...register("permit_notes")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Accessibility</label>
              <Input placeholder="Wheelchair accessible via side entrance" {...register("accessibility")} />
            </div>
          </div>
        )}

        {/* Step 2: Address + map pin */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pin location *</label>
              <LocationPickerMap
                value={
                  watchedLat && watchedLng
                    ? { lat: watchedLat, lng: watchedLng }
                    : null
                }
                onChange={({ lat, lng, address }) => {
                  setValue("lat", lat, { shouldValidate: true });
                  setValue("lng", lng, { shouldValidate: true });
                  if (address) setValue("address", address, { shouldValidate: true });
                }}
              />
              {(errors.lat || errors.lng) && (
                <p className="text-xs text-destructive">
                  Drop a pin on the map to set the location.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Address *</label>
              <Input
                placeholder="Auto-filled from pin — or type an address"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Photos + hashtags */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Photos *</label>
              <Controller
                control={control}
                name="photo_paths"
                render={() => (
                  <PhotoUploadField onChange={(paths) => setValue("photo_paths", paths)} />
                )}
              />
              {errors.photo_paths && (
                <p className="text-xs text-destructive">{errors.photo_paths.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hashtags * <span className="text-muted-foreground font-normal">(select at least one)</span></label>
              <Controller
                control={control}
                name="hashtag_ids"
                render={({ field }) => (
                  <HashtagSelector
                    hashtags={hashtags}
                    selected={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.hashtag_ids && (
                <p className="text-xs text-destructive">{errors.hashtag_ids.message}</p>
              )}
            </div>
          </div>
        )}

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button type="submit" className="ml-auto gap-2" disabled={pending}>
              {pending && <Spinner size="sm" className="text-primary-foreground" />}
              {pending ? "Submitting…" : "Submit Location"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
