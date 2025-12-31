import React from "react";

type Props = {
  totalItems: number;
  onClick: () => void;
};

export default function FloatingCartButton({ totalItems, onClick }: Props) {
  if (totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 transition z-50"
    >
      🛒
      <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white w-5 h-5 rounded-full flex items-center justify-center">
        {totalItems}
      </span>
    </button>
  );
}
