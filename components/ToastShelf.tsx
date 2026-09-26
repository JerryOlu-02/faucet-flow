export type ToastStatus = "pending" | "success" | "fail";

export type Toast = {
  status: ToastStatus;
  message: string;
};

const label: Record<ToastStatus, string> = {
  pending: "Pending",
  success: "Confirmed",
  fail: "Failed",
};

export function ToastShelf({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  if (!toast) return null;

  return (
    <div className="ff-toast-shelf" role="status" aria-live="polite">
      <article className={`ff-toast ff-toast-${toast.status}`}>
        <p className="ff-toast-label">{label[toast.status]}</p>
        <p className="ff-toast-message">{toast.message}</p>
        <button type="button" className="ff-toast-close" onClick={onDismiss}>
          Dismiss
        </button>
      </article>
    </div>
  );
}
