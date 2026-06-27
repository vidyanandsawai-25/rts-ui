
"use client";

import * as React from "react";
import { MinusIcon } from "lucide-react";
import { cn } from "./utils";

type InputOTPRootProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "maxLength"
> & {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  containerClassName?: string;
  children?: React.ReactNode;
};

const OTPInputContext = React.createContext<{
  value: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>; // ✅ FIX HERE
  maxLength: number;
  disabled?: boolean;
} | null>(null);

function InputOTP({
  className,
  containerClassName,
  value = "",
  onChange,
  maxLength = 6,
  children,
  disabled,
  ...props
}: InputOTPRootProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, "").slice(0, maxLength);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ([8, 9, 27, 13, 46].includes(e.keyCode)) return;

    if (
      (e.keyCode === 65 && e.ctrlKey) ||
      (e.keyCode === 67 && e.ctrlKey) ||
      (e.keyCode === 86 && e.ctrlKey) ||
      (e.keyCode === 88 && e.ctrlKey)
    ) {
      return;
    }

    if (
      (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const numericData = pastedData.replace(/\D/g, "").slice(0, maxLength);
    onChange?.(numericData);
  };

  React.useEffect(() => {
    if (inputRef.current && !disabled) inputRef.current.focus();
  }, [disabled]);

  return (
    <OTPInputContext.Provider
      value={{
        value,
        onChange: onChange || (() => {}),
        inputRef,
        maxLength,
        disabled,
      }}
    >
      <div
        data-slot="input-otp"
        className={cn(
          "relative flex items-center gap-2 has-disabled:opacity-50",
          containerClassName,
          className
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          maxLength={maxLength}
          disabled={disabled}
          className="absolute opacity-0 pointer-events-none"
          style={{ left: "-9999px" }}
          autoComplete="one-time-code"
          {...props}
        />

        {children}
      </div>
    </OTPInputContext.Provider>
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) {
  const context = React.useContext(OTPInputContext);
  const value = context?.value || "";
  const char = value[index] || "";

  const max = context?.maxLength ?? 6;
  const isActive = value.length === index || (value.length >= max && index === max - 1);
  const hasFakeCaret = isActive && !char && !context?.disabled;

  const handleClick = () => context?.inputRef.current?.focus();

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      onClick={handleClick}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border border-gray-300 text-sm bg-white transition-all outline-none cursor-text rounded-md hover:border-purple-400",
        isActive && "border-purple-500 ring-2 ring-purple-500/50 z-10",
        char && "border-purple-400",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-blink bg-purple-600 h-5 w-0.5" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator(props: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon className="w-4 h-4" />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
