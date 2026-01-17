"use client";

import { useEffect, useState } from "react";

export interface  ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  showPopup?: boolean;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  showPopup = true,
}: ToggleSwitchProps) {
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  useEffect(() => {
    if (showStatusPopup) {
      const timer = setTimeout(() => setShowStatusPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showStatusPopup]);

  const handleToggle = () => {
    setPopupText(!checked ? "Active" : "Inactive");
    if (showPopup) setShowStatusPopup(true);
    onChange();
  };

  const state = checked ? "checked" : "unchecked";

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}

      <div className="relative inline-flex items-center">
        {/* SWITCH TRACK */}
        <button
          type="button"
          data-state={state}
          onClick={handleToggle}
          className={`
            peer
            inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full
            border border-transparent
            transition-all outline-none
            data-[state=checked]:bg-blue-600
            focus-visible:border-ring
            focus-visible:ring-ring/50
            focus-visible:ring-[3px]

            disabled:cursor-not-allowed
            disabled:opacity-50
          `}
        >
          {/* SWITCH THUMB */}
          <span
            data-state={state}
            className={`
              pointer-events-none block h-4 w-4 rounded-full bg-white shadow
              transition-transform

              data-[state=checked]:translate-x-[0.9rem]
              data-[state=unchecked]:translate-x-[0.1rem]
            `}
          />
        </button>

        {/* STATUS POPUP */}
        {showStatusPopup && (
          <div
            className={`
              absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
              px-3 py-1.5 rounded-md shadow-lg border text-xs font-bold
              ${
                popupText === "Active"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-100 text-gray-600 border-gray-300"
              }
            `}
          >
            {popupText}
          </div>
        )}
      </div>
    </div>
  );
}