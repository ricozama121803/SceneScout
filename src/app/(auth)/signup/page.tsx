import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { MapPin } from "lucide-react";

export const metadata = { title: "Sign Up" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-black mb-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-border bg-primary shadow-shadow-sm">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            SceneScout
          </Link>
          <p className="text-muted-foreground text-sm font-medium">
            Create your filmmaker account
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border-2 border-border shadow-shadow rounded-lg p-6 space-y-5">
          {error && (
            <div className="rounded-sm bg-destructive/10 border-2 border-destructive px-3 py-2 text-sm font-bold text-destructive">
              {error}
            </div>
          )}

          <form action={signUp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-bold">
                Username
              </label>
              <Input
                id="username"
                name="username"
                placeholder="filmdirector42"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-bold">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-bold">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm font-medium text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-black text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
