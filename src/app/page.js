"use client";

import dynamic from "next/dynamic";
import ScrollSections from "@/components/layout/ScrollSections";

const StadiumScene = dynamic(() => import("@/components/3d/StadiumScene"), {
  ssr: false,
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