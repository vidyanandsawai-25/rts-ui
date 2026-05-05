'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { CheckboxProps } from '@/types/common.types';

// internal state type for aria/data-state values
export type CheckboxState = 'checked' | 'unchecked';

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    (
        {
            className,
            checked: controlledChecked,
            defaultChecked = false,
            onCheckedChange,
            disabled = false,
            name,
            value,
            label,
            onClick,
            onKeyDown,
            id: providedId,
            ...restProps
        },
        ref
    ): React.ReactNode => {
        /* ---- state --------------------------------------------------- */
        const generatedId = React.useId();
        const id = providedId || generatedId;
        const isControlled: boolean = controlledChecked !== undefined;
        const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked);
        const isChecked: boolean = (isControlled ? controlledChecked : internalChecked) ?? false;
        const dataState: CheckboxState = isChecked ? 'checked' : 'unchecked';

        /* ---- handlers ------------------------------------------------ */
        const toggle = React.useCallback((): void => {
            if (disabled) return;
            const next = !isChecked;

            if (!isControlled) {
                setInternalChecked(next);
            }

            onCheckedChange?.(next);
        }, [disabled, isChecked, isControlled, onCheckedChange]);

        const handleClick = React.useCallback(
            (e: React.MouseEvent<HTMLButtonElement>): void => {
                onClick?.(e);
                if (!e.defaultPrevented) toggle();
            },
            [onClick, toggle]
        );

        const handleKeyDown = React.useCallback(
            (e: React.KeyboardEvent<HTMLButtonElement>): void => {
                onKeyDown?.(e);
                if (!e.defaultPrevented && e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            },
            [onKeyDown, toggle]
        );

        /* ---- render -------------------------------------------------- */
        const checkboxContent = (
            <>
                <input
                    type="checkbox"
                    name={name}
                    value={value}
                    checked={isChecked}
                    readOnly
                    disabled={disabled}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="sr-only"
                />
                <button
                    ref={ref}
                    id={id}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    data-state={dataState}
                    disabled={disabled}
                    className={cn(
                        'peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow',
                        'transition-colors duration-150 ease-in-out',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        isChecked && 'bg-primary text-primary-foreground',
                        className
                    )}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    {...restProps}
                >
                    {isChecked && <Check className="h-3.5 w-3.5" />}
                </button>
            </>
        );

        if (label) {
            return (
                <div className="flex items-center gap-2">
                    {checkboxContent}
                    <label
                        htmlFor={id}
                        className={cn(
                            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                            disabled && "cursor-not-allowed opacity-50"
                        )}
                    >
                        {label}
                    </label>
                </div>
            );
        }

        return checkboxContent;
    }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
