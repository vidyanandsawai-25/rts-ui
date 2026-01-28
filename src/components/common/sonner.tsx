
import React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";

export interface ToasterPropsExtended extends ToasterProps {
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}

export function Toaster({
  className = "",
  style = {},
  "data-testid": dataTestId,
  ...props
}: ToasterPropsExtended) {
  return (
    <Sonner
      className={`toaster group ${className}`}
      style={style}
      data-testid={dataTestId ?? "toaster"}
      {...props}
    />
  );
}
