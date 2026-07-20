"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewPanel({ journalId }: { journalId: string }) {
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleApprove() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/journals/${journalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to approve");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/journals/${journalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", rejectionReason }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to reject");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="border-t border-primary/10 pt-6">
      <h2 className="font-serif text-xl font-semibold text-primary mb-4">
        Review Decision
      </h2>

      {!showRejectForm ? (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-success text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            className="bg-danger text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      ) : (
        <form onSubmit={handleReject} className="space-y-3">
          <label className="block text-sm font-medium text-text">
            Reason for rejection
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-surface resize-y"
            placeholder="Provide a reason for rejection..."
          />
          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !rejectionReason.trim()}
              className="bg-danger text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Reject"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason("");
              }}
              className="px-6 py-2 rounded-lg text-sm border border-primary/20 hover:bg-primary/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
