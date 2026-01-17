"use client";

import { toast } from "sonner";
import { Button } from "./Button";
import { CancelButton } from "./ActionButtons";

export function confirmDeleteToast(onConfirm: () => Promise<void> | void) {
  const toastId = toast.custom(
    () => (
      <div className="w-72 rounded-lg bg-white p-4 shadow-lg border">
        <p className="text-gray-800 font-semibold">
          Delete record?
        </p>
        <p className="text-sm text-gray-500 mt-1">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <CancelButton
            onClick={() => toast.dismiss(toastId)}
          />

          <Button
            variant="danger"
            onClick={async () => {
              toast.dismiss(toastId);
              await onConfirm(); // ✅ ALWAYS awaited
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
    }
  );
}