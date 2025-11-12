import React, { useState } from "react";

export default function ImagePreview({ preview }: { preview: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Imagen pequeña */}
      <img
        src={preview}
        alt="Preview"
        className="w-14 h-10 object-contain border rounded cursor-pointer"
        onClick={() => setIsOpen(true)}
      />

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)} // cerrar al hacer clic fuera
        >
          <img
            src={preview}
            alt="Preview grande"
            className="max-w-[90%] max-h-[90%] object-contain rounded shadow-lg"
            onClick={(e) => e.stopPropagation()} // evitar cerrar al hacer clic sobre la imagen
          />
        </div>
      )}
    </>
  );
}
