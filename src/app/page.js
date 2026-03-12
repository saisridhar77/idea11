"use client";

import dynamic from "next/dynamic";
import Loader from "@/components/ui/Loader";
import ScrollSections from "@/components/layout/ScrollSections";
import ConfettiOverlay from "@/components/ui/ConfettiOverlay";

const StadiumScene = dynamic(() => import("@/components/3d/StadiumScene"), {
  ssr: false,
  loading: () => <Loader />,
});

export default function Home() {
  return (
    <main className="relative w-full bg-brand-darker">
      <StadiumScene />
      <ScrollSections />
      {/* <ConfettiOverlay /> */}
    </main>
  );
}