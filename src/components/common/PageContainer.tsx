import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export  function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`
        bg-[#F8FAFC]
        ml-0
        transition-[margin]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
