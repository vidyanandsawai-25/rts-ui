
"use client";

import { toast } from "sonner";

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
          <button
            type="button"
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1 rounded bg-gray-200 text-gray-900 hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={async () => {
              toast.dismiss(toastId);
              await onConfirm(); // ✅ ALWAYS awaited
            }}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
    }
  );
}
