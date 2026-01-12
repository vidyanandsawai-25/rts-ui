
"use client";

import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`
        bg-[#F8FAFC]
        p-6 lg:p-8

        ml-0
      
        lg:[.sidebar-expanded_&]:ml-72

        transition-[margin] duration-300 ease-in-out
        ${className}
      `}
    >
      {children}
    </div>
  );
}
