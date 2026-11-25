"use client";

export function ConfirmForm({
  action,
  message,
  label,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  message: string;
  label: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      className={className}
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
      <button className="btn btn-secondary" type="submit">
        {label}
      </button>
    </form>
  );
}
