"use client";

/** Tombol submit dengan konfirmasi sebelum menghapus. */
export function DeleteButton({
  confirmText = "Yakin hapus data ini?",
  className = "",
  children = "Hapus",
}: {
  confirmText?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className={
        className ||
        "text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer"
      }
    >
      {children}
    </button>
  );
}
