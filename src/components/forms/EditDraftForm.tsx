"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Star } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploadField } from "./PhotoUploadField";
import { HashtagSelector } from "./HashtagSelector";
import { updateLocation, publishLocation } from "@/lib/actions/locations";
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

interface DraftForEdit {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  address: string | null;
  parking_notes: string | null;
  parking_score: number | null;
  permit_notes: string | null;
  accessibility: string | null;
  accessibility_score: number | null;
  photos: { url: string; storage_path: string; display_order: number }[];
  hashtag_ids: number[];
}

interface EditDraftFormProps {
  draft: DraftForEdit;
  hashtags: Hashtag[];
}

const STEPS = ["Details", "Location", "Photos & Tags"] as const;

export function EditDraftForm({ draft, hashtags }: EditDraftFormProps) {
  const [step, setStep] = useState(0);
  const [publishPending, startPublish] = useTransition();
  const [savePending, startSave] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initialPhotos = draft.photos
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => ({ path: p.storage_path, previewUrl: p.url }));

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CreateLocationInput>({
    resolver: zodResolver(CreateLocationSchema),
    defaultValues: {
      name: draft.name || "",
      description: draft.description || "",
      address: draft.address || "",
      lat: draft.lat,
      lng: draft.lng,
      parking_notes: draft.parking_notes || "",
      parking_score: draft.parking_score ?? undefined,
      permit_notes: draft.permit_notes || "",
      accessibility: draft.accessibility || "",
      accessibility_score: draft.accessibility_score ?? undefined,
      hashtag_ids: draft.hashtag_ids,
      photo_paths: initialPhotos.map((p) => p.path),
    },
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

  function handleSaveDraft() {
    setServerError(null);
    setSaveSuccess(false);
    const values = getValues();
    startSave(async () => {
      const result = await updateLocation(draft.id, values);
      if (result && "error" in result) {
        setServerError(result.error);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    });
  }

  function onPublish(data: CreateLocationInput) {
    setServerError(null);
    startPublish(async () => {
      const result = await publishLocation(draft.id, data);
      if (result?.error) setServerError(result.error);
    });
  }

  const pending = publishPending || savePending;

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

      <form onSubmit={handleSubmit(onPublish)} className="space-y-4">
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
              <label className="text-sm font-medium">Parking</label>
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="parking_score"
                  render={({ field }) => {
                    const [hovered, setHovered] = useState(0);
                    return (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => field.onChange(field.value === n ? undefined : n)}
                            onMouseEnter={() => setHovered(n)}
                            onMouseLeave={() => setHovered(0)}
                            className="p-0.5 focus:outline-none"
                          >
                            <Star className={`h-5 w-5 transition-colors ${n <= (hovered || (field.value ?? 0)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                        {field.value != null && <span className="ml-1 text-xs text-muted-foreground">{field.value}/5</span>}
                      </div>
                    );
                  }}
                />
                <Input placeholder="Notes — e.g. free street parking on weekends" {...register("parking_notes")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Permit notes</label>
              <Input placeholder="No permit needed for crews under 5" {...register("permit_notes")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Accessibility</label>
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="accessibility_score"
                  render={({ field }) => {
                    const [hovered, setHovered] = useState(0);
                    return (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => field.onChange(field.value === n ? undefined : n)}
                            onMouseEnter={() => setHovered(n)}
                            onMouseLeave={() => setHovered(0)}
                            className="p-0.5 focus:outline-none"
                          >
                            <Star className={`h-5 w-5 transition-colors ${n <= (hovered || (field.value ?? 0)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                        {field.value != null && <span className="ml-1 text-xs text-muted-foreground">{field.value}/5</span>}
                      </div>
                    );
                  }}
                />
                <Input placeholder="Notes — e.g. wheelchair accessible via side entrance" {...register("accessibility")} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pin location *</label>
              <LocationPickerMap
                value={watchedLat && watchedLng ? { lat: watchedLat, lng: watchedLng } : null}
                onChange={({ lat, lng, address }) => {
                  setValue("lat", lat, { shouldValidate: true });
                  setValue("lng", lng, { shouldValidate: true });
                  if (address) setValue("address", address, { shouldValidate: true });
                }}
              />
              {(errors.lat || errors.lng) && (
                <p className="text-xs text-destructive">Drop a pin on the map to set the location.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Address *</label>
              <Input placeholder="Auto-filled from pin — or type an address" {...register("address")} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Photos + Hashtags */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Photos *</label>
              <Controller
                control={control}
                name="photo_paths"
                render={({ field }) => (
                  <>
                    <PhotoUploadField
                      initialPhotos={initialPhotos}
                      onChange={(paths) => setValue("photo_paths", paths)}
                    />
                    {errors.photo_paths && field.value.length === 0 && (
                      <p className="text-xs text-destructive">{errors.photo_paths.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Hashtags * <span className="text-muted-foreground font-normal">(select at least one)</span>
              </label>
              <Controller
                control={control}
                name="hashtag_ids"
                render={({ field }) => (
                  <HashtagSelector hashtags={hashtags} selected={field.value} onChange={field.onChange} />
                )}
              />
              {errors.hashtag_ids && <p className="text-xs text-destructive">{errors.hashtag_ids.message}</p>}
            </div>
          </div>
        )}

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={pending}>
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={pending}
            className="gap-1.5"
          >
            {savePending && <Spinner size="sm" />}
            {saveSuccess ? "Saved!" : savePending ? "Saving…" : "Save Draft"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep} className="ml-auto" disabled={pending}>
              Next
            </Button>
          ) : (
            <Button type="submit" className="ml-auto gap-2" disabled={pending}>
              {publishPending && <Spinner size="sm" className="text-primary-foreground" />}
              {publishPending ? "Publishing…" : "Publish"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
