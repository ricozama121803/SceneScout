"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertTip } from "@/lib/actions/tips";
import { CommunityTipSchema, type CommunityTipInput } from "@/types/forms";
import { Lightbulb } from "lucide-react";
import { NOISE_LEVELS, CROWD_LEVELS, PERMIT_REQS } from "@/lib/utils/constants";

interface CommunityTipFormProps {
  locationId: string;
}

export function CommunityTipForm({ locationId }: CommunityTipFormProps) {
  const [, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CommunityTipInput>({
    resolver: zodResolver(CommunityTipSchema),
    defaultValues: { hidden_gem: false as boolean | undefined },
  });

  function onSubmit(data: CommunityTipInput) {
    startTransition(async () => {
      const result = await upsertTip(locationId, data);
      if (!result.error) setSubmitted(true);
    });
  }

  if (submitted) {
    return <p className="text-sm text-muted-foreground">Thanks for sharing your tip!</p>;
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Lightbulb className="h-3.5 w-3.5" />
        Write a tip
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Share your tip</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Best filming time</label>
          <Input placeholder="e.g. Golden hour, Early morning" {...register("filming_time")} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Noise level</label>
          <Select onValueChange={(v) => setValue("noise_level", v as CommunityTipInput["noise_level"])}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {NOISE_LEVELS.map((n) => (
                <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Crowd level</label>
          <Select onValueChange={(v) => setValue("crowd_level", v as CommunityTipInput["crowd_level"])}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {CROWD_LEVELS.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Permit required?</label>
          <Select onValueChange={(v) => setValue("permit_req", v as CommunityTipInput["permit_req"])}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {PERMIT_REQS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" {...register("hidden_gem")} className="rounded" />
        Mark as hidden gem
      </label>

      {Object.keys(errors).length > 0 && (
        <p className="text-sm text-destructive">Please fix the errors above</p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">Submit Tip</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
