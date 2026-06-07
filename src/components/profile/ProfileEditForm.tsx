"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateProfile } from "@/lib/actions/profile";
import { UpdateProfileSchema, type UpdateProfileInput } from "@/types/forms";
import { Pencil, X, Check } from "lucide-react";
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/brand-icons";

interface ProfileEditFormProps {
  initialValues: UpdateProfileInput;
}

export function ProfileEditForm({ initialValues }: ProfileEditFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: initialValues,
  });

  function onOpen() {
    reset(initialValues);
    setServerError(null);
    setSaved(false);
    setOpen(true);
  }

  function onCancel() {
    setOpen(false);
    setServerError(null);
  }

  function onSubmit(data: UpdateProfileInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.error) {
        setServerError(result.error);
      } else {
        setSaved(true);
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2" onClick={onOpen}>
          <Pencil className="h-3.5 w-3.5" />
          Edit Profile
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border-2 border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Edit Profile</h2>
        <button type="button" onClick={onCancel} aria-label="Close">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Username */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Username</label>
        <Input {...register("username")} placeholder="your_username" />
        {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
      </div>

      {/* Bio */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Bio <span className="text-muted-foreground font-normal">(optional)</span></label>
        <textarea
          {...register("bio")}
          placeholder="Tell the community a bit about yourself…"
          maxLength={160}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
        {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
      </div>

      {/* Show email */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show_email"
          {...register("show_email")}
          className="h-4 w-4 accent-primary"
        />
        <label htmlFor="show_email" className="text-sm cursor-pointer select-none">
          Show my email on my profile
        </label>
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Social Links <span className="text-muted-foreground font-normal">(optional)</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><InstagramIcon />Instagram</label>
            <div className="flex items-center">
              <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">@</span>
              <Input {...register("instagram")} placeholder="yourhandle" className="rounded-l-none" />
            </div>
            {errors.instagram && <p className="text-xs text-destructive">{errors.instagram.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><YoutubeIcon />YouTube</label>
            <div className="flex items-center">
              <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">@</span>
              <Input {...register("youtube")} placeholder="yourchannel" className="rounded-l-none" />
            </div>
            {errors.youtube && <p className="text-xs text-destructive">{errors.youtube.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><LinkedinIcon />LinkedIn</label>
            <div className="flex items-center">
              <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground font-mono text-xs">in/</span>
              <Input {...register("linkedin")} placeholder="yourname" className="rounded-l-none" />
            </div>
            {errors.linkedin && <p className="text-xs text-destructive">{errors.linkedin.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Website</label>
            <Input {...register("website")} placeholder="https://yoursite.com" />
            {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
          </div>
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-destructive font-medium">{serverError}</p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={pending} className="gap-2">
          {pending && <Spinner size="sm" />}
          Save Changes
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
