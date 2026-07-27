import type { Metadata } from "next";
import { AdminBookings } from "@/components/admin/admin-bookings";

export const metadata: Metadata = {
  title: "Admin — Bookings",
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return (
    <main id="main" className="min-h-screen px-4 py-12 sm:px-8">
      <AdminBookings />
    </main>
  );
}
