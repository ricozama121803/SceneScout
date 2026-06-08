"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploadField } from "./PhotoUploadField";
import { createRentalListing } from "@/lib/actions/rentals";
import { CreateRentalListingSchema, type CreateRentalListingInput } from "@/types/forms";
import { Spinner } from "@/components/ui/spinner";

const LocationPickerMap = dynamic(
  () => import("./LocationPickerMap").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => <div className="h-72 rounded-xl border bg-muted animate-pulse" />,
  }
);

const STEPS = ["Details & Pricing", "Location", "Photos"] as const;

export function AddRentalListingForm() {
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
  } = useForm<CreateRentalListingInput>({
    resolver: zodResolver(CreateRentalListingSchema),
    defaultValues: { photo_paths: [] },
  });

  const watchedLat = watch("lat");
  const watchedLng = watch("lng");

  async function nextStep() {
    const stepFields: (keyof CreateRentalListingInput)[][] = [
      ["name", "description"],
      ["address", "lat", "lng"],
      ["photo_paths"],
    ];
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => s + 1);
  }

  function onSubmit(data: CreateRentalListingInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createRentalListing(data);
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
                i <= step ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
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
        {/* Step 1: Details + Pricing */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Space name *</label>
              <Input placeholder="Rooftop Deck in Silver Lake, or Backyard Pool · Venice Beach" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Describe the space — size, vibe, natural light, unique features. What makes it ideal for a shoot?"
                rows={4}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Price per hour ($)</label>
                <Controller
                  control={control}
                  name="price_per_hour"
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="e.g. 50"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  )}
                />
                {errors.price_per_hour && <p className="text-xs text-destructive">{errors.price_per_hour.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Price per day ($)</label>
                <Controller
                  control={control}
                  name="price_per_day"
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="e.g. 300"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  )}
                />
                {errors.price_per_day && <p className="text-xs text-destructive">{errors.price_per_day.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amenities</label>
              <Textarea
                placeholder="WiFi, kitchen, 2 parking spots, dressing room, loading dock…"
                rows={2}
                {...register("amenities")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Rules & requirements</label>
              <Textarea
                placeholder="No smoking, max crew of 10, evenings and weekends only, no heavy equipment…"
                rows={2}
                {...register("rules")}
              />
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pin your space *</label>
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
              <Input
                placeholder="Auto-filled from pin — or type an address"
                {...register("address")}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 2 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Photos *</label>
            <p className="text-xs text-muted-foreground">Show off your space — interiors, lighting, unique features.</p>
            <Controller
              control={control}
              name="photo_paths"
              render={({ field }) => (
                <>
                  <PhotoUploadField onChange={(paths) => setValue("photo_paths", paths)} />
                  {errors.photo_paths && field.value.length === 0 && (
                    <p className="text-xs text-destructive">{errors.photo_paths.message}</p>
                  )}
                </>
              )}
            />
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
            <Button type="button" onClick={nextStep} className="ml-auto bg-emerald-500 hover:bg-emerald-600">
              Next
            </Button>
          ) : (
            <Button type="submit" className="ml-auto gap-2 bg-emerald-500 hover:bg-emerald-600" disabled={pending}>
              {pending && <Spinner size="sm" className="text-white" />}
              {pending ? "Saving…" : "Save Draft"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
