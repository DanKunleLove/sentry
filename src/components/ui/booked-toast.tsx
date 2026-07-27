"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Success toast shown on the homepage after a booking submission
 * (redirect target: /?booked=1). Cleans the query param on dismiss.
 */
export function BookedToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = React.useState(false);

  const booked = searchParams.get("booked") === "1";

  React.useEffect(() => {
    if (!booked) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace("/", { scroll: false });
    }, 8000);
    return () => clearTimeout(timer);
  }, [booked, router]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md"
    >
      <div className="glass-strong flex items-start gap-3 rounded-[20px] p-4 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.8)]">
        <span
          aria-hidden="true"
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
        />
        <p className="text-sm text-bone/90">
          Your request has been submitted. I&rsquo;ll review it and get back to
          you within 48 hours.
        </p>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setVisible(false);
            router.replace("/", { scroll: false });
          }}
          className="ml-auto shrink-0 p-1 text-bone/50 transition-colors hover:text-bone"
        >
          ×
        </button>
      </div>
    </div>
  );
}
