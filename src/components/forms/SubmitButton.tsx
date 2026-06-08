"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ComponentProps } from "react";

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  label: string;
  loadingLabel?: string;
}

export function SubmitButton({ label, loadingLabel, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Spinner size="sm" className="text-primary-foreground" />}
      {pending ? (loadingLabel ?? label) : label}
    </Button>
  );
}
