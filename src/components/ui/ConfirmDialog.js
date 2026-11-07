"use client";

import { useEffect, useId, useRef } from "react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const cancelHandler = useRef(onCancel);

  useEffect(() => {
    cancelHandler.current = onCancel;
  });

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The safe choice gets focus first, so Enter never deletes by accident.
    cancelRef.current?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelHandler.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll("button");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="anim-fade fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={() => cancelHandler.current()}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-sm text-slate-600">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium text-white " +
              (danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
