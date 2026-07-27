import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ActionConfirm } from "@/components/sections/booking-action-confirm";

export const metadata: Metadata = {
  title: "Booking action — Dan Adelusi",
  robots: { index: false, follow: false },
};

export default async function BookingActionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main id="main" className="pt-36 sm:pt-48">
      <Container>
        <div className="mx-auto max-w-md pb-24">
          <ActionConfirm token={token ?? ""} />
        </div>
      </Container>
    </main>
  );
}
