import { signIn, signInWithOAuth } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/SubmitButton";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";

export const metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
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
            Welcome back! Sign in to discover and share the newest filming locations today.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border-2 border-border shadow-shadow rounded-lg p-6 space-y-5">
          {error && (
            <div className="rounded-sm bg-destructive/10 border-2 border-destructive px-3 py-2 text-sm font-bold text-destructive">
              {error === "auth_callback_failed"
                ? "Authentication failed. Please try again."
                : error}
            </div>
          )}

          <form action={signIn} className="space-y-4">
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
            <SubmitButton label="Sign In" loadingLabel="Signing in…" className="w-full" size="lg" />
          </form>

          {/* <div className="relative"> */}
            {/* <div className="absolute inset-0 flex items-center"> */}
              {/* <div className="w-full border-t-2 border-border" /> */}
            {/* </div> */}
            {/* <div className="relative flex justify-center text-xs"> */}
              {/* <span className="bg-card px-2 font-bold text-muted-foreground"> */}
                {/* or continue with */}
              {/* </span> */}
            {/* </div> */}
          {/* </div> */}
{/*  */}
          {/* <div className="grid grid-cols-2 gap-3"> */}
            {/* <form action={signInWithOAuth.bind(null, "google")}> */}
              {/* <Button variant="outline" className="w-full" type="submit"> */}
                {/* Google */}
              {/* </Button> */}
            {/* </form> */}
            {/* <form action={signInWithOAuth.bind(null, "github")}> */}
              {/* <Button variant="outline" className="w-full" type="submit"> */}
                {/* GitHub */}
              {/* </Button> */}
            {/* </form> */}
          {/* </div> */}
        </div>

        <p className="text-center text-sm font-medium text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-black text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
