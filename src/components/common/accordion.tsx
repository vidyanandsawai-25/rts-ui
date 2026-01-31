
import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AccordionItemType {
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItemType[];
  multiple?: boolean;
  defaultOpen?: number[];
  className?: string;
}

export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  className = "",
}: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpen);

  const handleToggle = (idx: number) => {
    if (items[idx].disabled) return;
    if (multiple) {
      setOpenIndexes((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(idx) ? [] : [idx]));
    }
  };

  return (
    <div className={cn("border rounded-md divide-y", className)}>
      {items.map((item, idx) => {
        const isOpen = openIndexes.includes(idx);
        return (
          <div key={idx} className={cn("bg-white", item.disabled && "opacity-50" )}>
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-between py-4 px-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-300",
                isOpen && "font-semibold",
                item.disabled && "cursor-not-allowed"
              )}
              onClick={() => handleToggle(idx)}
              disabled={item.disabled}
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <ChevronDownIcon className={cn("ml-2 w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")}/>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all text-sm px-4",
                isOpen ? "max-h-96 py-2" : "max-h-0 py-0"
              )}
              style={{ transitionProperty: "max-height, padding" }}
              aria-hidden={!isOpen}
            >
              {isOpen && item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
