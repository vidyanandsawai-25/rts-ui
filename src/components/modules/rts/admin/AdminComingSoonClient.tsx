"use client";

import { Wrench } from "lucide-react";

type AdminComingSoonClientProps = {
  title: string;
  message: string;
  iconTone: "teal" | "purple";
};

export default function AdminComingSoonClient({
  title,
  message,
  iconTone,
}: AdminComingSoonClientProps) {
  const accent =
    iconTone === "purple"
      ? {
          circle: "bg-[#f0e2ff]",
          icon: "text-[#9822ff]",
        }
      : {
          circle: "bg-[#d8faf3]",
          icon: "text-[#05958c]",
        };

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-7">
        <h1 className="text-4xl font-medium tracking-tight text-[#102b55]">{title}</h1>
      </div>

      <div className="rounded-[24px] border border-[#dfe7ef] bg-white px-6 py-14 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-full ${accent.circle}`}>
            <Wrench className={`h-10 w-10 ${accent.icon}`} />
          </div>
          <h2 className="text-5xl font-medium tracking-tight text-[#112c56]">Coming Soon</h2>
          <p className="mt-4 text-2xl text-[#42567c]">{message}</p>
        </div>
      </div>
    </div>
  );
}
