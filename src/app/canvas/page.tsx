import type { Metadata } from "next";
import { Suspense } from "react";
import { CanvasApp } from "./CanvasApp";

export const metadata: Metadata = {
  title: "Artifact canvas",
  description: "Generate and preview HTML artifacts with your own model key.",
};

export default function CanvasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <CanvasApp />
    </Suspense>
  );
}
