"use client";
import { useEffect, useState, useId } from "react";

export interface ToggleSwitchProps {
  checked: boolean;
  /**
   * Callback when toggled. Accepts either (checked: boolean) => void or () => void for backward compatibility.
   */
  onChange: ((checked: boolean) => void) | (() => void);
  label?: string;
  showPopup?: boolean;
  disabled?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  popupDuration?: number; // ms, default 2000
}
export function ToggleSwitch({
  checked,
  onChange,
  label,
  showPopup = true,
  disabled = false,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  popupDuration = 2000,
}: ToggleSwitchProps) {
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  useEffect(() => {
    if (showStatusPopup && popupDuration > 0) {
      const timer = setTimeout(() => setShowStatusPopup(false), popupDuration);
      return () => clearTimeout(timer);
    }
  }, [showStatusPopup, popupDuration]);

  const handleToggle = () => {
    if (disabled) return;
    setPopupText(!checked ? activeLabel : inactiveLabel);
    if (showPopup) setShowStatusPopup(true);
    // Always call onChange with the new checked state; callbacks that ignore arguments remain compatible.
    onChange(!checked);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  const state = checked ? "checked" : "unchecked";

  // Generate a stable unique id for the label if label is provided
  const reactId = useId();
  const labelId = label ? `toggle-switch-label-${reactId}` : undefined;
  return (
    <div className="flex items-center gap-3">
      {label && (
        <span id={labelId} className="text-sm font-medium text-gray-700">{label}</span>
      )}

      <div className="relative inline-flex items-center">
        {/* SWITCH TRACK */}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={!label ? (checked ? activeLabel : inactiveLabel) : undefined}
          aria-labelledby={label ? labelId : undefined}
          data-state={state}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`
            peer
            inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full
            border border-transparent
            transition-all outline-none
            data-[state=checked]:bg-blue-600
            focus-visible:border-ring
            focus-visible:ring-ring/50
            focus-visible:ring-[3px]
            text-gray-900
            bg-gray-200
            hover:bg-gray-300
            disabled:cursor-not-allowed
            disabled:opacity-50
          `}
          disabled={disabled}
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
                popupText === activeLabel
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