import React from "react";

export default function MainBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f5f8fd] rounded-2xl shadow-lg p-8 w-full max-w-4xl mx-auto flex flex-col items-center my-8">
      {children}
    </div>
  );
}
