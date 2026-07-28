"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUploadPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setUploading(true);
    setStep("Validating...");

    const form = new FormData(e.currentTarget);
    const token = localStorage.getItem("admin_token");

    setStep("Uploading to storage...");
    const res = await fetch("/api/admin/journals", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Upload failed");
      setUploading(false);
      setStep("");
      return;
    }

    setStep("Saving record...");
    await new Promise((r) => setTimeout(r, 200));

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary text-center mb-8">
        Upload Published Journal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-gray-200 p-6 space-y-5"
      >
        {error && (
          <div className="bg-danger/10 text-danger text-sm px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Paper Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            disabled={uploading}
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="authors" className="block text-sm font-medium mb-1">
            Author Name(s)
          </label>
          <input
            id="authors"
            name="authors"
            type="text"
            required
            disabled={uploading}
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="abstract" className="block text-sm font-medium mb-1">
            Abstract
          </label>
          <textarea
            id="abstract"
            name="abstract"
            required
            disabled={uploading}
            rows={6}
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent resize-y disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="volume" className="block text-sm font-medium mb-1">
            Volume <span className="text-text-muted">(optional)</span>
          </label>
          <input
            id="volume"
            name="volume"
            type="text"
            disabled={uploading}
            placeholder="e.g., Vol. 1, No. 1"
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-1">
            Upload PDF
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            disabled={uploading}
            accept=".pdf,application/pdf"
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary file:text-white file:text-sm file:font-medium file:cursor-pointer"
          />
          <p className="text-text-muted text-xs mt-1">
            Maximum file size: 15MB. PDF only.
          </p>
        </div>

        {uploading && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium text-primary">{step}</p>
                <div className="w-full max-w-48 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: "60%" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-accent text-primary font-semibold py-3 rounded hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-lg flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            "Publish Journal"
          )}
        </button>
      </form>
    </div>
  );
}
