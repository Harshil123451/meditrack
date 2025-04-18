"use client";

import dynamic from "next/dynamic";

// Dynamically import the AddMedicine component with no SSR
const AddMedicine = dynamic(
  () => import("../components/AddMedicine"),
  { ssr: false }
);

export default function AddMedicinePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AddMedicine />
    </div>
  );
} 