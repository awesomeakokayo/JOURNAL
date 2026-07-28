"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError({});
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      fullName: form.get("fullName") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || { form: ["Registration failed"] });
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: body.email,
      password: body.password,
      redirect: false,
    });

    router.push("/dashboard");
    router.refresh();
  }

  function fieldError(field: string) {
    return error[field] ? (
      <span className="text-danger text-xs">{error[field][0]}</span>
    ) : null;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-16">
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary text-center mb-8">
        Register
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-gray-200 p-6 space-y-4"
      >
        {error.form && (
          <div className="bg-danger/10 text-danger text-sm px-4 py-2 rounded">
            {error.form[0]}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {fieldError("fullName")}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {fieldError("email")}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {fieldError("password")}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-semibold py-2.5 rounded hover:bg-primary-light transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
